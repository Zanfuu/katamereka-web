import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isBusinessHost, BUSINESS_SITE_URL } from "@/lib/site-config";

// Same default/override precedence as lib/api-client.ts's API_BASE_URL —
// duplicated (not imported) so this edge function doesn't pull in that
// file's mock-data imports just for one constant.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "https://api.katamereka.id";

// Business-owner area
const BUSINESS_PATH_PREFIXES = ["/dashboard", "/settings"];
// Platform admin area: needs PlatformRole ADMIN/SUPER_ADMIN.
const ADMIN_PATH_PREFIXES = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

interface SessionClaims {
  id?: string;
  email?: string;
  role?: "USER" | "ADMIN" | "SUPER_ADMIN" | "bisnis" | string;
  businessRole?: "OWNER" | "ADMIN" | "MEMBER" | string | null;
}

function decodeJwtPayload(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Asks the API who this token actually belongs to right now, instead of
// verifying the JWT signature locally — that would need JWT_SECRET
// duplicated into this frontend's deployment env, a second place for the
// same secret to leak from. The API is the only thing that ever needs it.
async function fetchSessionClaims(token: string): Promise<SessionClaims | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as SessionClaims;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  const isBusinessSubdomain = isBusinessHost(hostname);

  const requestHeaders = new Headers(request.headers);
  if (isBusinessSubdomain) {
    requestHeaders.set("x-is-business-subdomain", "true");
  }

  const needsBusinessAccess = matchesPrefix(pathname, BUSINESS_PATH_PREFIXES);
  const needsAdminAccess = matchesPrefix(pathname, ADMIN_PATH_PREFIXES);

  if (needsBusinessAccess || needsAdminAccess) {
    const token = request.cookies.get("km_session")?.value;
    const roleCookie = request.cookies.get("km_role")?.value;

    const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
    const baseRedirectUrl = isLocal ? request.nextUrl.origin : BUSINESS_SITE_URL;

    // Jika belum ada token sesi sama sekali, arahkan ke login
    if (!token) {
      if (needsAdminAccess) {
        const loginUrl = new URL("/superadmin/login", baseRedirectUrl);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      } else {
        const loginUrl = new URL("/login", baseRedirectUrl);
        loginUrl.searchParams.set("role", "bisnis");
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    const jwtPayload = decodeJwtPayload(token);
    // Jika token JWT sudah kadaluarsa (expired), arahkan kembali ke login
    if (jwtPayload?.exp && jwtPayload.exp * 1000 < Date.now()) {
      const loginUrl = new URL(needsAdminAccess ? "/superadmin/login" : "/login", baseRedirectUrl);
      if (!needsAdminAccess) {
        loginUrl.searchParams.set("role", "bisnis");
      }
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("km_session");
      res.cookies.delete("km_role");
      return res;
    }

    const claims = await fetchSessionClaims(token);

    if (needsAdminAccess) {
      const isPlatformAdmin =
        claims?.role === "ADMIN" ||
        claims?.role === "SUPER_ADMIN" ||
        jwtPayload?.role === "ADMIN" ||
        jwtPayload?.role === "SUPER_ADMIN";
      if (!isPlatformAdmin) {
        const loginUrl = new URL("/superadmin/login", baseRedirectUrl);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else if (needsBusinessAccess) {
      // User di akun bisnis (baik dari role cookie bisnis, subdomain bisnis, businessRole, atau claims)
      // harus langsung bisa masuk ke dashboard tanpa disuruh login lagi.
      // Hanya tolak jika user eksplisit hanya akun customer murni.
      const isCustomerOnly =
        roleCookie === "customer" &&
        !isBusinessSubdomain &&
        !claims?.businessRole &&
        claims?.role !== "bisnis" &&
        jwtPayload?.role !== "bisnis";

      if (isCustomerOnly) {
        return NextResponse.redirect(new URL("/bisnis", request.url));
      }

      // Pengguna bisnis yang sudah login diizinkan masuk ke dashboard
    }
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
