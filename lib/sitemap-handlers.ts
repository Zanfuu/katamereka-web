/**
 * Content negotiation for sitemap routes. One URL, two representations:
 *
 *  - crawlers / API clients  -> raw sitemaps.org XML (the canonical output)
 *  - people in a browser     -> HTML table (lib/sitemap-html.ts)
 *
 * XML is the default; HTML is only chosen when we're confident a human
 * browser asked for it, so a misdetection can never hurt indexing.
 */

import type { NextRequest } from "next/server";
import { BUSINESS_SITE_URL, CONSUMER_SITE_URL, isBusinessHost } from "@/lib/site-config";
import { buildSitemapIndexXml, buildUrlsetXml, xmlResponse } from "@/lib/sitemap";
import { htmlResponse, renderSitemapIndexHtml, renderUrlsetHtml } from "@/lib/sitemap-html";
import { getIndexSections, getSection, type SitemapSectionId } from "@/lib/sitemap-sections";

// Crawlers often send a browser-like Accept (text/html first), so Accept
// alone isn't enough — known bot User-Agents always get XML.
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|mediapartners|apis-google|google-inspectiontool|googleother|feedfetcher|facebookexternalhit|yandex|baidu|duckduck|ia_archiver/i;

function prefersHtml(request: NextRequest): boolean {
  // Explicit override: ?format=xml | ?format=html (handy for debugging).
  const format = request.nextUrl.searchParams.get("format");
  if (format === "xml") return false;
  if (format === "html") return true;

  if (BOT_UA.test(request.headers.get("user-agent") ?? "")) return false;

  // Browsers always list text/html; crawlers/curl send */* or xml types only.
  return /\btext\/html\b/i.test(request.headers.get("accept") ?? "");
}

function siteNameFor(host: string | null): string {
  return isBusinessHost(host) ? "Katamereka Bisnis" : "Katamereka";
}

/** Latest lastmod across a section's URLs, as an ISO string (or undefined). */
function latestLastmod(urls: { lastmod?: string }[]): string | undefined {
  let latest: string | undefined;
  for (const { lastmod } of urls) {
    if (lastmod && (!latest || lastmod > latest)) latest = lastmod;
  }
  return latest;
}

/** GET handler body for app/sitemap.xml — the sitemap index. */
export async function sitemapIndexResponse(request: NextRequest): Promise<Response> {
  const host = request.headers.get("host");
  const siteUrl = isBusinessHost(host) ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;
  const sections = getIndexSections(host);

  if (!prefersHtml(request)) {
    // Bots: no need to load every child just to list their locations.
    return xmlResponse(
      buildSitemapIndexXml(sections.map((s) => ({ loc: `${siteUrl}${s.path}` }))),
    );
  }

  const isBusiness = isBusinessHost(host);
  const rows = await Promise.all(
    sections.map(async (s) => {
      const urls = await s.load(isBusiness);
      return { loc: `${siteUrl}${s.path}`, urlCount: urls.length, lastmod: latestLastmod(urls) };
    }),
  );

  return htmlResponse(
    renderSitemapIndexHtml(rows, { siteName: siteNameFor(host), generatedAt: new Date() }),
  );
}

/** GET handler body for app/sitemap-<section>.xml — one child sitemap. */
export async function sitemapSectionResponse(
  request: NextRequest,
  id: SitemapSectionId,
): Promise<Response> {
  const host = request.headers.get("host");
  const section = getSection(id);
  const urls = await section.load(isBusinessHost(host));

  if (!prefersHtml(request)) return xmlResponse(buildUrlsetXml(urls));

  return htmlResponse(
    renderUrlsetHtml(urls, {
      siteName: siteNameFor(host),
      label: section.label,
      generatedAt: new Date(),
    }),
  );
}
