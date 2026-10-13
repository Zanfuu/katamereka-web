import type { Metadata } from "next";
import { fetchBusinessBySlug } from "@/lib/api-client";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const res = await fetchBusinessBySlug(slug);
  const b = res?.data;

  return {
    title: b ? `Semua Ulasan: ${b.name} | Katamereka` : `Semua Ulasan | Katamereka`,
    description: b
      ? `Baca semua ulasan dan rating pelanggan untuk ${b.name} di Katamereka.`
      : `Baca semua ulasan dan rating bisnis di Katamereka.`,
    alternates: {
      canonical: `${CONSUMER_SITE_URL}/business/${slug}`,
    },
  };
}

export default function BusinessReviewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
