import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = ["/participant", "/company"];
const AUTH_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("access_token")?.value;
  const role = request.cookies.get("user_role")?.value;

  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  // Not authenticated → protected routes → /login
  if (!token) {
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Authenticated on auth routes → dashboard
  if (isAuthRoute) {
    if (role === "company") {
      return NextResponse.redirect(new URL("/company", request.url));
    }
    return NextResponse.redirect(new URL("/participant", request.url));
  }

  // Role mismatch: company on /participant → /company
  if (role === "company" && pathname.startsWith("/participant")) {
    return NextResponse.redirect(new URL("/company", request.url));
  }

  // Role mismatch: participant on /company → /participant
  if (role === "participant" && pathname.startsWith("/company")) {
    return NextResponse.redirect(new URL("/participant", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/participant/:path*", "/company/:path*"],
};
