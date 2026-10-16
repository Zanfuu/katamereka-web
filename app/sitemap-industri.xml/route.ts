import type { NextRequest } from "next/server";
import { sitemapSectionResponse } from "@/lib/sitemap-handlers";

// Business-domain-only section: one entry per industry landing page.
export async function GET(request: NextRequest) {
  return sitemapSectionResponse(request, "industri");
}
