import type { NextRequest } from "next/server";
import { sitemapSectionResponse } from "@/lib/sitemap-handlers";

// Static marketing/landing pages for whichever domain the request hit.
export async function GET(request: NextRequest) {
  return sitemapSectionResponse(request, "pages");
}
