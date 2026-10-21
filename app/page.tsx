import LandingPage from "./home-content";
import {
  fetchCategoryFacets,
  fetchCityFacets,
  fetchBusinesses,
  fetchLatestReviews,
  fetchBusinessPlaceImage,
  mapApiBusinessToUiModel,
} from "@/lib/api-client";
import { JsonLd } from "@/lib/json-ld";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/schema-org";
import { buildPageMetadata } from "@/lib/seo-metadata";
import { CONSUMER_SITE_URL } from "@/lib/site-config";

export const metadata = buildPageMetadata({
  title: "Katamereka — Dengarkan Ulasan Sebelum Memilih Bisnis",
  description: "Temukan bisnis terpercaya berdasarkan pengalaman nyata pelanggan.",
  url: `${CONSUMER_SITE_URL}/`,
});

// ISR: the home page (incl. the place-image lookups below) is rendered once
// and re-used for 5 minutes instead of on every crawler hit.
export const revalidate = 300;

export default async function Page() {
  const [categoryFacets, cityFacets, popularRes, latestReviewsRes] = await Promise.all([
    fetchCategoryFacets(),
    fetchCityFacets(),
    fetchBusinesses({ limit: 50, sort: "popular" }),
    fetchLatestReviews({ limit: 3 }),
  ]);

  let allBusinesses =
    popularRes && popularRes.data && Array.isArray(popularRes.data)
      ? popularRes.data.map(mapApiBusinessToUiModel)
      : [];

  // Urutkan secara dinamis berdasarkan ulasan/rating terbanyak, lalu rating tertinggi
  allBusinesses.sort((a, b) => {
    const countA = a.reviewCount || 0;
    const countB = b.reviewCount || 0;
    if (countB !== countA) return countB - countA;
    return (b.rating || 0) - (a.rating || 0);
  });

  let initialPopularBusinesses = allBusinesses.slice(0, 5);

  if (initialPopularBusinesses.length > 0) {
    initialPopularBusinesses = await Promise.all(
      initialPopularBusinesses.map(async (biz) => {
        if (!biz.imageUrl && biz.name) {
          try {
            const img = await fetchBusinessPlaceImage(
              biz.name,
              biz.location || "Indonesia",
              biz.latitude,
              biz.longitude
            );
            if (img) {
              return { ...biz, imageUrl: img };
            }
          } catch {}
        }
        return biz;
      })
    );
  }

  return (
    <>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />
      <LandingPage
        initialCategoryFacets={categoryFacets}
        initialCityFacets={cityFacets}
        initialPopularBusinesses={initialPopularBusinesses}
        initialRecentReviews={latestReviewsRes?.data ?? []}
      />
    </>
  );
}


