import { sendWelcomeEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    const errorUrl = new URL("/signin", request.url);
    errorUrl.searchParams.set("error", "missing_token");
    return NextResponse.redirect(errorUrl);
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { gt: new Date() },
    },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
    },
  });

  if (!user) {
    const errorUrl = new URL("/signin", request.url);
    errorUrl.searchParams.set("error", "expired_token");
    return NextResponse.redirect(errorUrl);
  }

  // Mark user's email as verified and clear tokens
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: new Date(),
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  // Send onboarding welcome email upon successful verification
  sendWelcomeEmail({ to: user.email, name: user.name }).catch((err) =>
    console.error("[VerifyEmail] Failed to send welcome email:", err)
  );

  const successUrl = new URL("/signin", request.url);
  successUrl.searchParams.set("verified", "true");
  successUrl.searchParams.set("email", user.email);
  return NextResponse.redirect(successUrl);
}
