import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hashSessionToken, SESSION_COOKIE_NAME, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const session = await prisma.session.findFirst({
      where: {
        tokenHash: hashSessionToken(token),
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    const { reason, feedback, confirmPassword } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: "Please select a reason for leaving." }, { status: 400 });
    }

    // Verify password if provided
    if (confirmPassword) {
      const isValid = await verifyPassword(confirmPassword, session.user.passwordHash);
      if (!isValid) {
        return NextResponse.json({ error: "Incorrect password. Account deletion cancelled." }, { status: 400 });
      }
    }

    const userEmail = session.user.email;
    const userId = session.user.id;

    console.log(`[Account Deletion Survey] User: ${userEmail} | Reason: ${reason} | Feedback: ${feedback || "N/A"}`);

    // Delete user sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    // Delete driver profile if matching email
    await prisma.driver.deleteMany({
      where: { email: userEmail },
    });

    // Delete user record
    await prisma.user.delete({
      where: { id: userId },
    });

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json({
      success: true,
      redirectUrl: "/signin?deleted=true",
    });
  } catch (error: any) {
    console.error("[Account Deletion Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete account." },
      { status: 500 }
    );
  }
}
