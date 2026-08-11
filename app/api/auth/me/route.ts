import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Internal endpoint used by middleware to check the current user's role.
// Accepts a pre-hashed token via the x-token-hash header to avoid Edge runtime
// Prisma limitations in middleware.
export async function GET(request: NextRequest) {
  const tokenHash = request.headers.get("x-token-hash");

  if (!tokenHash) {
    return NextResponse.json({ role: null }, { status: 401 });
  }

  try {
    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
      },
      select: {
        user: {
          select: { role: true, email: true, id: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    let role = session.user.role;

    // Auto-correct legacy driver accounts that have MANAGER role
    if (role === "MANAGER") {
      const driverRecord = await prisma.driver.findFirst({
        where: { email: session.user.email },
        select: { id: true },
      });
      if (driverRecord) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { role: "DRIVER" },
        });
        role = "DRIVER";
      }
    }

    return NextResponse.json({ role });
  } catch (error) {
    console.error("[/api/auth/me error]:", error);
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
