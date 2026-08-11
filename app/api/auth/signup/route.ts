import {
  generateVerificationToken,
  hashPassword,
  normalizeEmail,
  safeRedirectPath,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function signupError(request: Request, error: string, redirectTo: string) {
  const url = new URL("/signup", request.url);
  url.searchParams.set("error", error);
  url.searchParams.set("from", redirectTo);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const redirectTo = safeRedirectPath(formData.get("redirectTo")?.toString() ?? null);
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";

  if (name.length < 2 || name.length > 100 || !email || password.length < 8 || password.length > 128) {
    return signupError(request, "invalid", redirectTo);
  }

  if (password !== confirmPassword) {
    return signupError(request, "password_mismatch", redirectTo);
  }

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    return signupError(request, "exists", redirectTo);
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    // Dispatch verification email via Resend (non-blocking)
    sendVerificationEmail({ to: email, name, token: verificationToken }).catch((err) =>
      console.error("[Signup] Unexpected error triggering verification email:", err)
    );
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return signupError(request, "exists", redirectTo);
    }
    throw error;
  }

  // Redirect to signin with a message requiring email confirmation before signing in
  const redirectUrl = new URL("/signin", request.url);
  redirectUrl.searchParams.set("registered", "true");
  redirectUrl.searchParams.set("email", email);
  if (redirectTo !== "/dashboard") {
    redirectUrl.searchParams.set("from", redirectTo);
  }

  return NextResponse.redirect(redirectUrl, { status: 303 });
}