/**
 * Site-wide schema.org builders (Organization, WebSite, BreadcrumbList,
 * ItemList, Review). Business-entity schema lives in lib/business-seo.ts.
 * All builders return plain objects; render them with <JsonLd /> from
 * lib/json-ld.tsx so they are escaped safely.
 */
import { CONSUMER_SITE_URL } from "./site-config";

export const ORGANIZATION_ID = `${CONSUMER_SITE_URL}/#organization`;
export const WEBSITE_ID = `${CONSUMER_SITE_URL}/#website`;

/**
 * Official social profile URLs for Organization.sameAs, comma-separated,
 * e.g. NEXT_PUBLIC_SOCIAL_URLS="https://instagram.com/katamereka,https://www.linkedin.com/company/katamereka".
 * Env-driven on purpose: sameAs must point at real, owned profiles, and none
 * are hard-coded anywhere in the codebase. Empty => property is omitted.
 */
function socialProfileUrls(): string[] {
  return (process.env.NEXT_PUBLIC_SOCIAL_URLS || "")
    .split(",")
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u));
}

export function buildOrganizationSchema(): Record<string, unknown> {
  const sameAs = socialProfileUrls();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: "Katamereka",
    alternateName: "Katamereka.id",
    url: CONSUMER_SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${CONSUMER_SITE_URL}/logo.png`,
    },
    description:
      "Katamereka adalah platform ulasan bisnis di Indonesia: baca pengalaman nyata pelanggan sebelum memilih bisnis.",
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: "Katamereka",
    url: CONSUMER_SITE_URL,
    inLanguage: "id-ID",
    publisher: { "@id": ORGANIZATION_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${CONSUMER_SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(
  crumbs: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function buildItemListSchema(
  name: string,
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: it.url,
      name: it.name,
    })),
  };
}

/** Minimal shape of a public review as returned by GET /businesses/:id/reviews. */
export interface SchemaReviewInput {
  id?: string;
  rating?: number | string | null;
  title?: string | null;
  content?: string | null;
  status?: string | null;
  createdAt?: string;
  created_at?: string;
  user?: { name?: string | null } | null;
}

const MAX_REVIEWS_IN_SCHEMA = 20;

/**
 * schema.org Review[] for the public reviews of one business. Meant to be
 * nested as `review` inside the business entity (Google ignores standalone
 * Review nodes that have no itemReviewed parent). Unpublished reviews and
 * ones without a valid 1-5 rating or any text are dropped: markup must
 * mirror what a visitor can actually read on the page.
 */
export function buildReviewSchemas(
  reviews: SchemaReviewInput[]
): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];

  for (const r of reviews) {
    if (r.status && r.status !== "PUBLISHED") continue;

    const rating = typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? ""));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) continue;

    const body = (r.content || "").trim();
    if (!body) continue;

    const created = r.createdAt || r.created_at;
    const date = created ? new Date(created) : null;

    const review: Record<string, unknown> = {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: (r.user?.name || "").trim() || "Pengguna Katamereka",
      },
      reviewBody: body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: rating,
        bestRating: "5",
        worstRating: "1",
      },
    };
    if (date && !Number.isNaN(date.getTime())) review.datePublished = date.toISOString();
    if (r.title && r.title.trim()) review.name = r.title.trim();

    out.push(review);
    if (out.length >= MAX_REVIEWS_IN_SCHEMA) break;
  }

  return out;
}
