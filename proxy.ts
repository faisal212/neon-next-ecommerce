import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = request.cookies.get("__Secure-neon-auth.session_token")
      || request.cookies.get("better-auth.session_token");
    if (!session) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect /admin/login to /admin if already authenticated
  if (pathname === "/admin/login") {
    const session = request.cookies.get("__Secure-neon-auth.session_token")
      || request.cookies.get("better-auth.session_token");
    if (session) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
