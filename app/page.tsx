import LandingPage from "./home-content";
import {
  fetchCategoryFacets,
  fetchCityFacets,
  fetchBusinesses,
  fetchBusinessPlaceImage,
  mapApiBusinessToUiModel,
} from "@/lib/api-client";

export default async function Page() {
  const [categoryFacets, cityFacets, popularRes] = await Promise.all([
    fetchCategoryFacets(),
    fetchCityFacets(),
    fetchBusinesses({ limit: 50, sort: "popular" }),
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
    <LandingPage
      initialCategoryFacets={categoryFacets}
      initialCityFacets={cityFacets}
      initialPopularBusinesses={initialPopularBusinesses}
    />
  );
}


