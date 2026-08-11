import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      const tokenHash = hashSessionToken(token);
      await prisma.session.deleteMany({
        where: { tokenHash },
      });
    }

    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true, redirectUrl: "/signin" });
  } catch (error) {
    console.error("[Signout error]:", error);
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ success: true, redirectUrl: "/signin" });
  }
}