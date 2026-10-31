import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveMediaUrl } from "@/lib/api-client";
import { getBusinessForSsr } from "@/lib/business-ssr";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import {
  buildBusinessDescription,
  buildBusinessTitle,
} from "@/lib/business-seo";
import { buildPageMetadata } from "@/lib/seo-metadata";

interface LayoutProps {
  children: React.ReactNode;
}

// generateMetadata() and the page share getBusinessForSsr() (React
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

// NOTE: Structured data (<JsonLd>) is intentionally rendered in app/business/[slug]/page.tsx
// rather than here. Placing schema.org LocalBusiness + AggregateRating in layout.tsx causes
// child routes (e.g. /business/[slug]/reviews) to inherit the markup. Since /reviews has its
// canonical pointing back to /business/[slug], Google Search Console detects duplicate aggregate
// ratings under the same canonical URL ("Review has multiple aggregate ratings").
export default function BusinessSlugLayout({ children }: LayoutProps) {
  return children;
}
