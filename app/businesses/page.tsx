import {
  fetchBusinesses,
  fetchCategoryFacets,
  mapApiBusinessToUiModel,
} from "@/lib/api-client";
import { categoryDisplayName, isRealBusinessCategory } from "@/lib/slug";
import { CONSUMER_SITE_URL } from "@/lib/site-config";
import { JsonLd } from "@/lib/json-ld";
import { buildBreadcrumbSchema, buildItemListSchema } from "@/lib/schema-org";
import BusinessesClient from "./businesses-client";

// ISR: directory is served from cache and refreshed in the background, so bots
// get a fast TTFB instead of waiting on the API (and its per-row detail fetches).
export const revalidate = 300;

export default async function BusinessesPage() {
  const [listRes, facets] = await Promise.all([
    fetchBusinesses({ sort: "popular", page: 1, limit: 12 }),
    fetchCategoryFacets(),
  ]);

  const businesses = (listRes?.data ?? []).map(mapApiBusinessToUiModel);

  const categoryNames = facets
    .filter((f) => isRealBusinessCategory(f.category))
    .map((f) => categoryDisplayName(f.category))
    .filter((v, i, a) => v && a.indexOf(v) === i);

  const initial = {
    businesses,
    totalCount: listRes?.pagination?.total || businesses.length,
    totalPages: listRes?.pagination?.total_pages || 1,
    categories: categoryNames.length > 0 ? ["Semua Kategori", ...categoryNames] : [],
  };

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbSchema([
            { name: "Beranda", url: `${CONSUMER_SITE_URL}/` },
            { name: "Daftar Bisnis", url: `${CONSUMER_SITE_URL}/businesses` },
          ]),
          buildItemListSchema(
            "Daftar Bisnis Terpopuler di Katamereka",
            businesses.map((b) => ({
              name: b.name,
              url: `${CONSUMER_SITE_URL}/business/${b.slug}`,
            }))
          ),
        ]}
      />
      <BusinessesClient initial={initial} />
    </>
  );
}
