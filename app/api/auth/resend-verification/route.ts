import {
  createSession,
  generateVerificationToken,
  normalizeEmail,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = normalizeEmail(formData.get("email")?.toString() ?? "");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, emailVerified: true },
    });

    if (!user) {
      // Return 200 to prevent email enumeration
      return NextResponse.json({ success: true, message: "If an account exists, a verification link has been sent." });
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: "Email is already verified." });
    }

    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
      },
    });

    await sendVerificationEmail({ to: email, name: user.name, token: verificationToken });

    return NextResponse.json({ success: true, message: "Verification link sent successfully." });
  } catch (error) {
    console.error("[ResendVerification] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
