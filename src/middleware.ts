import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("business_session");
  const isLoggedIn = !!session?.value;
  const isLoginPage = pathname === "/dashboard/login";

  // Login page: allow access if not logged in, redirect to dashboard if logged in
  if (isLoginPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    // Not logged in - allow access to login page
    return NextResponse.next();
  }

  // All other dashboard routes: require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard/login", request.url));
  }

  // Logged in and accessing protected route - allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
