import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes (login/callback/signout)
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for Auth.js session cookie
  const hasSession =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  if (!hasSession) {
    // Redirect unauthenticated users to sign-in
    const signInUrl = new URL("/api/auth/signin", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except static files and auth API
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
