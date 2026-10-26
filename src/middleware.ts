import { NextRequest, NextResponse } from "next/server";

/**
 * Frontend-only middleware
 * Auth is now handled by the backend API
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (request.method === 'HEAD') {
    return new NextResponse(null, { status: 200 });
  }

  // All routing and authentication is handled client-side or by backend API
  return NextResponse.next();
}

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|svg|images).*)",
  ],
};
