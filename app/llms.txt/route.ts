import type { NextRequest } from "next/server";
import { buildBusinessLlmsTxt, buildConsumerLlmsTxt } from "@/lib/llms-txt";
import { isBusinessHost } from "@/lib/site-config";

// /llms.txt for AI search crawlers. Same path, different content per
// domain: katamereka.id (consumer) vs business.katamereka.id (B2B), picked
// the same way as app/robots.ts and the sitemaps.
export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const body = isBusinessHost(host) ? await buildBusinessLlmsTxt() : await buildConsumerLlmsTxt();

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      Vary: "Host",
    },
  });
}
