/**
 * Next.js Middleware
 * Handles basic routing logic (client-side protection handles auth)
 * 
 * Note: We use httpOnly cookies for authentication. While cookies are accessible in middleware,
 * we rely on client-side ProtectedRoute/GuestRoute components for route protection for simplicity.
 * This can be enhanced in the future to check cookies server-side if needed.
 */

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow all routes - client-side components handle protection
  // Middleware can be extended for other purposes (logging, analytics, etc.)
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

