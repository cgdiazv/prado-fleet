import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LEGACY_DASHBOARD_PATHS = new Set([
  "/tracking",
  "/dvir",
  "/maintenance",
  "/assets",
  "/fuel",
  "/settings",
]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("prado_fleet_session")?.value);

  if (LEGACY_DASHBOARD_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL(`/dashboard${pathname}${search}`, request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    if (!hasSession) {
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("from", `${pathname}${search}`);
      return NextResponse.redirect(signinUrl);
    }
    return NextResponse.next();
  }

  if (hasSession && (pathname === "/signin" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};