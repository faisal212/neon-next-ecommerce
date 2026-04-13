import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Read the Neon Auth / better-auth session cookie from a request, if present.
 * Edge-safe — does NOT validate the session, only checks existence. Validation
 * happens in the DAL (`lib/auth/getCurrentUser`, wrapped in React `cache()`).
 */
function readSessionCookie(request: NextRequest) {
  return (
    request.cookies.get("__Secure-neon-auth.session_token") ||
    request.cookies.get("better-auth.session_token")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all admin routes except /admin/login
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!readSessionCookie(request)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Note: we intentionally do NOT redirect authenticated users away from
  // /admin/login. The proxy is edge-safe and can't verify admin role — only
  // cookie existence. A customer (non-admin) with a valid session would get
  // stuck in a redirect loop. The admin/login page handles "already admin"
  // itself after role verification.

  // Protect all /account routes — optimistic cookie-existence check only.
  // Real session validation lives in the DAL (see lib/auth/getCurrentUser),
  // following the Next.js 16 "Optimistic checks with Proxy" pattern:
  // https://nextjs.org/docs/app/guides/authentication
  if (pathname.startsWith("/account")) {
    if (!readSessionCookie(request)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
