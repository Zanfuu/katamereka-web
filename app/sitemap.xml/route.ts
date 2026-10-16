import type { NextRequest } from "next/server";
import { sitemapIndexResponse } from "@/lib/sitemap-handlers";

// Top-level sitemap index: one row per section, each pointing at its own
// child sitemap (see app/sitemap-pages.xml, sitemap-business.xml, etc.)
// instead of one giant flat file — easier to audit, and each section can
// be regenerated/cached independently.
//
// Reads Accept/User-Agent to serve XML to crawlers and an HTML table to
// browsers, so it renders per request; caching is via Cache-Control/Vary.
export async function GET(request: NextRequest) {
  return sitemapIndexResponse(request);
}
