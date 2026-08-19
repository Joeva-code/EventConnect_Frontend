import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = ["/dashboard", "/events", "/my-events"];

function hasProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const refreshCookie = request.cookies.get("refreshToken");

  if (hasProtectedPath(pathname)) {
    if (!refreshCookie) {
      const signin = new URL("/signin", request.url);
      signin.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signin);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
