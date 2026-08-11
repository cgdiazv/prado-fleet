import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "prado_fleet_session";

// Proxy: fast cookie check + forward pathname as a custom header so
// the layout server component can do role-based redirects server-side.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users to sign-in
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      const signinUrl = new URL("/signin", request.url);
      signinUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(signinUrl);
    }
  }

  // Forward the pathname so layout server components can access it
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
