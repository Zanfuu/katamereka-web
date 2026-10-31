import { notFound } from "next/navigation";
import {
  getBusinessForSsr,
  getBusinessReviewsForSsr,
  getBusinessReviewSummaryForSsr,
  getBusinessReviewAiSummaryForSsr,
} from "@/lib/business-ssr";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { buildBusinessSchema } from "@/lib/business-seo";
import { JsonLd } from "@/lib/json-ld";
import { buildBreadcrumbSchema } from "@/lib/schema-org";
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

function cleanCategory(raw: string): string {
  return raw.replace(/^(service|building)\./, "").replace(/_/g, " ").trim();
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

  const categoryLabel = cleanCategory(business.category || "") || "Bisnis";
  const categoryUrl = `${CONSUMER_SITE_URL}/businesses?category=${encodeURIComponent(categoryLabel)}`;
  const businessUrl = `${CONSUMER_SITE_URL}/business/${business.slug}`;

  // Renders LocalBusiness/Restaurant/Hotel/... (+ AggregateRating) and
  // BreadcrumbList JSON-LD directly from this leaf page so only the canonical
  // business profile holds the aggregate rating (avoiding duplicate schema
  // on sub-routes like /reviews).
  return (
    <>
      <JsonLd
        data={[
          buildBusinessSchema(business, businessUrl, reviews),
          buildBreadcrumbSchema([
            { name: "Home", url: `${CONSUMER_SITE_URL}/` },
            { name: categoryLabel, url: categoryUrl },
            { name: business.name, url: businessUrl },
          ]),
        ]}
      />
      <BusinessProfileClient
        initialDetail={business}
        initialReviews={reviews}
        initialReviewSummary={reviewSummary}
        initialAiReviewSummary={aiReviewSummary}
      />
    </>
  );
}
