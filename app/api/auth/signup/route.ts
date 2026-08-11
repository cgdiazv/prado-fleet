import {
  createSession,
  hashPassword,
  normalizeEmail,
  safeRedirectPath,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
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

  if (name.length < 2 || name.length > 100 || !email || password.length < 8 || password.length > 128) {
    return signupError(request, "invalid", redirectTo);
  }

  const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    return signupError(request, "exists", redirectTo);
  }

  const passwordHash = await hashPassword(password);
  const session = createSession();

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        sessions: {
          create: {
            tokenHash: session.tokenHash,
            expiresAt: session.expiresAt,
          },
        },
      },
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return signupError(request, "exists", redirectTo);
    }
    throw error;
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  response.cookies.set(SESSION_COOKIE_NAME, session.token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: session.expiresAt,
  });

  return response;
}