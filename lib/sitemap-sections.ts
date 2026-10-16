/**
 * Data side of the sitemap: which child sitemaps exist and which URLs each
 * one lists. Shared by the XML routes (app/sitemap-*.xml) and by the HTML
 * view of the sitemap index, which needs a URL count per child sitemap.
 */

import { fetchCategoryFacets, fetchCityFacets, fetchSitemapBusinesses } from "@/lib/api-client";
import { industries } from "@/lib/mock/industries";
import { BUSINESS_SITE_URL, CONSUMER_SITE_URL, isBusinessHost } from "@/lib/site-config";
import { slugify } from "@/lib/slug";
import { toIsoDate, type SitemapUrl } from "@/lib/sitemap";

export type SitemapSectionId = "pages" | "business" | "kategori" | "lokasi" | "industri";

export interface SitemapSection {
  /** Public path of the child sitemap. */
  path: string;
  /** Human label used in the HTML view's breadcrumb. */
  label: string;
  /** `isBusiness` = request came in on the business.* host. */
  load: (isBusiness: boolean) => Promise<SitemapUrl[]>;
}

// katamereka.id — consumer/review platform. Only pages with real SEO value:
// no /login, /signup, /search (gated or thin/duplicate content).
const CONSUMER_STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/businesses", changefreq: "daily", priority: "0.9" },
  { loc: "/bisnis", changefreq: "weekly", priority: "0.6" },
  { loc: "/ulasan", changefreq: "daily", priority: "0.7" },
  { loc: "/tentang-kami", changefreq: "monthly", priority: "0.4" },
  { loc: "/untuk-bisnis", changefreq: "monthly", priority: "0.5" },
  { loc: "/bantuan", changefreq: "monthly", priority: "0.4" },
];

// business.katamereka.id — B2B marketing site. Deliberately excludes
// /dashboard, /login, /signup, /settings (gated app, not marketing content).
const BUSINESS_STATIC_ROUTES: SitemapUrl[] = [
  { loc: "/", changefreq: "daily", priority: "1.0" },
  { loc: "/solusi", changefreq: "monthly", priority: "0.7" },
  { loc: "/produk", changefreq: "monthly", priority: "0.7" },
  { loc: "/harga", changefreq: "monthly", priority: "0.7" },
  { loc: "/tentang-kami", changefreq: "monthly", priority: "0.4" },
  { loc: "/bantuan", changefreq: "monthly", priority: "0.4" },
];

const SECTIONS: Record<SitemapSectionId, SitemapSection> = {
  pages: {
    path: "/sitemap-pages.xml",
    label: "Halaman",
    async load(isBusiness) {
      const siteUrl = isBusiness ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;
      const routes = isBusiness ? BUSINESS_STATIC_ROUTES : CONSUMER_STATIC_ROUTES;
      return routes.map((r) => ({ ...r, loc: `${siteUrl}${r.loc}` }));
    },
  },

  // Consumer-only section: every public business profile.
  business: {
    path: "/sitemap-business.xml",
    label: "Bisnis",
    async load() {
      const businesses = await fetchSitemapBusinesses();
      const urls: SitemapUrl[] = [];
      for (const b of businesses) {
        if (!b.slug) continue;
        urls.push({
          loc: `${CONSUMER_SITE_URL}/business/${b.slug}`,
          lastmod: toIsoDate(b.updated_at),
          changefreq: "weekly",
          priority: "0.8",
        });
      }
      return urls;
    },
  },

  // Consumer-only section: one entry per real, live category — same facet
  // source /kategori/[slug] resolves a slug against, so every URL here is
  // guaranteed to render.
  kategori: {
    path: "/sitemap-kategori.xml",
    label: "Kategori",
    async load() {
      const facets = await fetchCategoryFacets();
      return uniqueSlugUrls(
        facets.map((f) => f.category),
        "/kategori",
        "0.6",
      );
    },
  },

  // Consumer-only section: one entry per real, live city — same facet
  // source /lokasi/[slug] resolves a slug against.
  lokasi: {
    path: "/sitemap-lokasi.xml",
    label: "Lokasi",
    async load() {
      const facets = await fetchCityFacets();
      return uniqueSlugUrls(
        facets.map((f) => f.city),
        "/lokasi",
        "0.5",
      );
    },
  },

  // Business-domain-only section: one entry per industry landing page.
  industri: {
    path: "/sitemap-industri.xml",
    label: "Industri",
    async load() {
      return industries
        .filter((ind) => ind.status === "ACTIVE")
        .map((ind) => ({
          loc: `${BUSINESS_SITE_URL}/industri/${slugify(ind.name)}`,
          changefreq: "monthly",
          priority: "0.5",
        }));
    },
  },
};

const CONSUMER_INDEX: SitemapSectionId[] = ["pages", "business", "kategori", "lokasi"];
const BUSINESS_INDEX: SitemapSectionId[] = ["pages", "industri"];

function uniqueSlugUrls(names: string[], basePath: string, priority: string): SitemapUrl[] {
  const seen = new Set<string>();
  const urls: SitemapUrl[] = [];
  for (const name of names) {
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    urls.push({ loc: `${CONSUMER_SITE_URL}${basePath}/${slug}`, changefreq: "weekly", priority });
  }
  return urls;
}

export function getSection(id: SitemapSectionId): SitemapSection {
  return SECTIONS[id];
}

/** Child sitemaps listed in the index for the host the request came in on. */
export function getIndexSections(host: string | null): SitemapSection[] {
  const ids = isBusinessHost(host) ? BUSINESS_INDEX : CONSUMER_INDEX;
  return ids.map((id) => SECTIONS[id]);
}
