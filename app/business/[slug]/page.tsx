import { notFound } from "next/navigation";
import {
  getBusinessForSsr,
  getBusinessReviewsForSsr,
  getBusinessReviewSummaryForSsr,
  getBusinessReviewAiSummaryForSsr,
} from "@/lib/business-ssr";
import BusinessProfileClient from "./business-profile-client";

// ISR: served from cache, regenerated in the background at most every 5 min.
// Slugs not pre-built at `next build` are rendered on first request and then
// cached too (dynamicParams defaults to true).
export const revalidate = 300;

// Pre-render nothing at build time (the API may be unreachable then), but
// declaring generateStaticParams is what opts this dynamic route into ISR:
// each slug is rendered on first hit and cached from then on.
export async function generateStaticParams() {
  return [];
}

export default async function BusinessProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await getBusinessForSsr(slug);
  if (!business) notFound();

  const [reviews, reviewSummary, aiReviewSummary] = await Promise.all([
    getBusinessReviewsForSsr(business.id),
    getBusinessReviewSummaryForSsr(business.id),
    getBusinessReviewAiSummaryForSsr(business.id),
  ]);

  // The client component is still hydrated for interactivity, but it starts
  // from this data, so the raw HTML already holds name, rating, address,
  // category and reviews (no "Memuat profil bisnis..." spinner in the source).
  return (
    <BusinessProfileClient
      initialDetail={business}
      initialReviews={reviews}
      initialReviewSummary={reviewSummary}
      initialAiReviewSummary={aiReviewSummary}
    />
  );
}
