import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export function middleware(request: NextRequest) {
  // Protected routes that require authentication
  const protectedPaths = ["/dashboard", "/admin", "/team", "/auction"]
  const isProtectedPath = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Allow viewer access to dashboard and auction without token
  const isViewerPath =
    request.nextUrl.pathname === "/dashboard" && request.nextUrl.searchParams.get("role") === "viewer"

  const isAuctionViewer = request.nextUrl.pathname === "/auction"

  if (isProtectedPath && !isViewerPath && !isAuctionViewer) {
    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET || "fallback-secret")
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/team/:path*", "/auction/:path*"],
}
