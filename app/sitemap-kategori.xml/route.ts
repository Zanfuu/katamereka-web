import type { NextRequest } from "next/server";
import { sitemapSectionResponse } from "@/lib/sitemap-handlers";

// Consumer-only section: one entry per live category.
export async function GET(request: NextRequest) {
  return sitemapSectionResponse(request, "kategori");
}
