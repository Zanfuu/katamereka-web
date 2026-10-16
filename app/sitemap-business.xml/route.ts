import type { NextRequest } from "next/server";
import { sitemapSectionResponse } from "@/lib/sitemap-handlers";

// Consumer-only section: every public business profile.
export async function GET(request: NextRequest) {
  return sitemapSectionResponse(request, "business");
}
