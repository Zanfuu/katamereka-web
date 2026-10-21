import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveMediaUrl } from "@/lib/api-client";
import { getBusinessForSsr } from "@/lib/business-ssr";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { buildPageMetadata } from "@/lib/seo-metadata";

// Canonical points at the profile page on purpose: it already carries the
// Review[] schema and the same reviews, so this page consolidates into it
// instead of competing as duplicate content.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const b = await getBusinessForSsr(slug);
  if (!b) notFound();

  return buildPageMetadata({
    title: `Semua Ulasan: ${b.name} | Katamereka`,
    description: `Baca semua ulasan dan rating pelanggan untuk ${b.name} di Katamereka.`,
    url: `${CONSUMER_SITE_URL}/business/${b.slug}`,
    image: resolveMediaUrl(b.coverUrl || b.cover_url || b.photos?.[0] || b.logoUrl || b.logo_url),
  });
}

export default function BusinessReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
