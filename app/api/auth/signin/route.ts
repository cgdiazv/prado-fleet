import {
  createSession,
  normalizeEmail,
  safeRedirectPath,
  SESSION_COOKIE_NAME,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function signinError(request: Request, redirectTo: string) {
  const url = new URL("/signin", request.url);
  url.searchParams.set("error", "credentials");
  url.searchParams.set("from", redirectTo);
  return NextResponse.redirect(url, { status: 303 });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const redirectTo = safeRedirectPath(formData.get("redirectTo")?.toString() ?? null);
  const email = normalizeEmail(formData.get("email")?.toString() ?? "");
  const password = formData.get("password")?.toString() ?? "";

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true, emailVerified: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return signinError(request, redirectTo);
  }

  // Option 1: Block sign-in if email has not been verified yet
  if (!user.emailVerified) {
    const unverifiedUrl = new URL("/signin", request.url);
    unverifiedUrl.searchParams.set("error", "unverified");
    unverifiedUrl.searchParams.set("email", email);
    if (redirectTo !== "/dashboard") {
      unverifiedUrl.searchParams.set("from", redirectTo);
    }
    return NextResponse.redirect(unverifiedUrl, { status: 303 });
  }

  const session = createSession();
  await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
    },
  });

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