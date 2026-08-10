import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

function safeRedirectPath(pathname: string | null) {
  if (!pathname) {
    return "/dashboard";
  }

  return pathname.startsWith("/dashboard") ? pathname : "/dashboard";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const redirectTo = safeRedirectPath(formData.get("redirectTo")?.toString() ?? null);

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set("prado_fleet_session", randomUUID(), {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}