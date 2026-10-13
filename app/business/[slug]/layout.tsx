import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchBusinessBySlug } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import {
  buildBusinessDescription,
  buildBusinessSchema,
  buildBusinessTitle,
} from "@/lib/business-seo";

interface LayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

function cleanCategory(raw: string): string {
  return raw.replace(/^(service|building)\./, "").replace(/_/g, " ").trim();
}

/**
 * generateMetadata() and the layout body below both need this business's
 * data. cache() (React's per-request memoization) makes them share one
 * fetch instead of issuing two separate requests that could disagree if the
 * backend is flaky mid-request.
 */
const getBusiness = cache(async (slug: string) => {
  const decoded = decodeURIComponent(slug).trim();
  try {
    const res = await fetchBusinessBySlug(decoded);
    if (res?.data) return res.data;
  } catch {}
  try {
    const res = await fetchBusinessBySlug(slug);
    if (res?.data) return res.data;
  } catch {}
  return null;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusiness(slug);
  if (!b) notFound();

  return {
    title: buildBusinessTitle(b),
    description: buildBusinessDescription(b),
    alternates: {
      canonical: `${CONSUMER_SITE_URL}/business/${b.slug}`,
    },
  };
}

// Renders LocalBusiness/Restaurant/Hotel/... + AggregateRating + BreadcrumbList
// JSON-LD around the (client-rendered) profile page, using a server-side
// fetch so the markup is present in the initial HTML for crawlers,
// independent of the page's own client-side data fetch.
export default async function BusinessSlugLayout({ params, children }: LayoutProps) {
  const { slug } = await params;
  const b = await getBusiness(slug);
  if (!b) notFound();

  const categoryLabel = cleanCategory(b.category || "") || "Bisnis";
  const categoryUrl = `${CONSUMER_SITE_URL}/businesses?category=${encodeURIComponent(categoryLabel)}`;
  const businessUrl = `${CONSUMER_SITE_URL}/business/${b.slug}`;

  const localBusinessSchema = buildBusinessSchema(b, businessUrl);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${CONSUMER_SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: categoryLabel, item: categoryUrl },
      { "@type": "ListItem", position: 3, name: b.name, item: businessUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {children}
    </>
  );
}
