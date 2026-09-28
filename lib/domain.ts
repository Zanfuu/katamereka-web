"use client";

/**
 * Helper to get the appropriate URL for "For Business" / Business landing page.
 * Returns subdomain URL in production/localhost or falls back to '/bisnis'.
 */
export function getBusinessUrl(): string {
  if (typeof window !== "undefined") {
    const { host, protocol } = window.location;

    // Handle localhost testing
    if (host.includes("localhost")) {
      if (host.startsWith("business.")) {
        return "/bisnis";
      }
      const port = window.location.port ? `:${window.location.port}` : "";
      return `${protocol}//business.localhost${port}`;
    }

    // Handle production Katamereka domain
    if (host.includes("katamereka.id")) {
      return "https://business.katamereka.id";
    }
  }

  return "/bisnis";
}

/**
 * Checks if current page is running under business context or business subdomain
 */
export function isBusinessDomain(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.host;
    return host.startsWith("business.") || window.location.pathname.startsWith("/bisnis") || window.location.pathname.startsWith("/untuk-bisnis");
  }
  return false;
}
