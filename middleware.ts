import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Check if accessing via business subdomain
  // Examples: business.katamereka.id, business.localhost, business.localhost:3000, business.localhost.id
  const isBusinessSubdomain =
    hostname.startsWith("business.") ||
    hostname.startsWith("business-") ||
    hostname.includes(".business.");

  // Create response headers to pass subdomain info down to client/server components if needed
  const requestHeaders = new Headers(request.headers);
  if (isBusinessSubdomain) {
    requestHeaders.set("x-is-business-subdomain", "true");
  }

  // Rewrite root '/' to '/bisnis' when on business subdomain
  if (isBusinessSubdomain && pathname === "/") {
    return NextResponse.rewrite(new URL("/bisnis", request.url), {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static files with extensions (.png, .jpg, .svg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
