import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveMediaUrl } from "@/lib/api-client";
import { getBusinessForSsr, getBusinessReviewsForSsr } from "@/lib/business-ssr";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import {
  buildBusinessDescription,
  buildBusinessSchema,
  buildBusinessTitle,
} from "@/lib/business-seo";
import { JsonLd } from "@/lib/json-ld";
import { buildBreadcrumbSchema } from "@/lib/schema-org";
import { buildPageMetadata } from "@/lib/seo-metadata";

interface LayoutProps {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

function cleanCategory(raw: string): string {
  return raw.replace(/^(service|building)\./, "").replace(/_/g, " ").trim();
}

// generateMetadata() and the layout body share getBusinessForSsr() (React
// cache() + Next data cache), so one request = one upstream fetch.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusinessForSsr(slug);
  if (!b) notFound();

  return buildPageMetadata({
    title: buildBusinessTitle(b),
    description: buildBusinessDescription(b),
    url: `${CONSUMER_SITE_URL}/business/${b.slug}`,
    image: resolveMediaUrl(b.coverUrl || b.cover_url || b.photos?.[0] || b.logoUrl || b.logo_url),
  });
}

// Renders LocalBusiness/Restaurant/Hotel/... (+ AggregateRating + Review[]) and
// BreadcrumbList JSON-LD from the server, so the markup is in the initial HTML
// regardless of whether the crawler runs the page's client JavaScript.
export default async function BusinessSlugLayout({ params, children }: LayoutProps) {
  const { slug } = await params;
  const b = await getBusinessForSsr(slug);
  if (!b) notFound();
  const reviews = await getBusinessReviewsForSsr(b.id);

  const categoryLabel = cleanCategory(b.category || "") || "Bisnis";
  const categoryUrl = `${CONSUMER_SITE_URL}/businesses?category=${encodeURIComponent(categoryLabel)}`;
  const businessUrl = `${CONSUMER_SITE_URL}/business/${b.slug}`;

  return (
    <>
      <JsonLd
        data={[
          buildBusinessSchema(b, businessUrl, reviews),
          buildBreadcrumbSchema([
            { name: "Home", url: `${CONSUMER_SITE_URL}/` },
            { name: categoryLabel, url: categoryUrl },
            { name: b.name, url: businessUrl },
          ]),
        ]}
      />
      {children}
    </>
  );
}
