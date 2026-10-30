import { notFound } from "next/navigation";
import {
  getBusinessForSsr,
  getBusinessReviewsForSsr,
  getBusinessReviewSummaryForSsr,
  getBusinessReviewAiSummaryForSsr,
} from "@/lib/business-ssr";
import BusinessReviewsClient from "./reviews-client";

export const revalidate = 300;

// Opts the dynamic route into ISR (render on first hit, then cache).
export async function generateStaticParams() {
  return [];
}

export default async function BusinessReviewsPage({
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

  return (
    <BusinessReviewsClient
      initialBusiness={business}
      initialReviews={reviews}
      initialReviewSummary={reviewSummary}
      initialAiReviewSummary={aiReviewSummary}
    />
  );
}
