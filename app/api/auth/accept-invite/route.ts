import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, hashPassword, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Invitation token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Find driver matching token
    const driver = await prisma.driver.findFirst({
      where: {
        inviteToken: token,
        inviteExpires: { gt: new Date() },
      },
    });

    if (!driver) {
      return NextResponse.json(
        { error: "Invalid or expired invitation link. Please request a new invite from your manager." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create or update user account for driver
    const user = await prisma.user.upsert({
      where: { email: driver.email },
      update: {
        name: driver.name,
        passwordHash,
        role: "DRIVER",
        emailVerified: new Date(),
      },
      create: {
        name: driver.name,
        email: driver.email,
        passwordHash,
        role: "DRIVER",
        emailVerified: new Date(),
      },
    });

    // Mark invitation as accepted
    await prisma.driver.update({
      where: { id: driver.id },
      data: {
        inviteToken: null,
        inviteExpires: null,
        inviteAccepted: new Date(),
      },
    });

    // Create session and set cookie
    const sessionData = createSession();
    await prisma.session.create({
      data: {
        tokenHash: sessionData.tokenHash,
        expiresAt: sessionData.expiresAt,
        userId: user.id,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionData.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: sessionData.expiresAt,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      redirectUrl: "/dashboard/driver-portal",
    });
  } catch (error: any) {
    console.error("[Accept Invite Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to set password." },
      { status: 500 }
    );
  }
}
