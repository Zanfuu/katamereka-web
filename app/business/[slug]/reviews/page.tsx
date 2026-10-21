import { notFound } from "next/navigation";
import { getBusinessForSsr, getBusinessReviewsForSsr } from "@/lib/business-ssr";
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

  const reviews = await getBusinessReviewsForSsr(business.id);

  return <BusinessReviewsClient initialBusiness={business} initialReviews={reviews} />;
}
