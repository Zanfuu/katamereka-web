/**
 * Category-aware SEO builders for /business/[slug]. Keeping title/description/
 * JSON-LD generation here (instead of inline in the layout) means the profile
 * page and any future business-facing page (e.g. dashboard previews) derive
 * identical metadata from the same rules — no risk of two pages describing
 * the same business differently.
 */
import { type ApiBusinessDetail, resolveMediaUrl } from "./api-client";
import type { SchemaReviewInput } from "./schema-org";

export type BusinessCategoryGroup =
  | "RESTAURANT"
  | "HOTEL"
  | "KOST"
  | "RETAIL"
  | "SERVICE"
  | "OTHER";

// Keyword sets cover both the Geoapify dot-namespaced taxonomy the backend
// syncs (e.g. "catering.restaurant", "accommodation.guest_house") and the
// plain Indonesian labels used by local/mock data (e.g. "Restoran").
const RESTAURANT_KEYWORDS = [
  "catering",
  "restaurant",
  "restoran",
  "cafe",
  "kafe",
  "food",
  "kuliner",
  "bakery",
];
const KOST_KEYWORDS = ["kost", "kos ", "boarding", "rumah_kos"];
const HOTEL_KEYWORDS = [
  "accommodation",
  "hotel",
  "guest_house",
  "hostel",
  "penginapan",
  "akomodasi",
  "lodging",
  "inn",
];
const RETAIL_KEYWORDS = [
  "commercial",
  "shop",
  "shopping",
  "retail",
  "toko",
  "store",
  "minimarket",
  "supermarket",
  "electronics",
  "elektronik",
  "fashion",
  "e-commerce",
  "ecommerce",
];
const SERVICE_KEYWORDS = [
  "service",
  "jasa",
  "rental",
  "automotive",
  "otomotif",
  "healthcare",
  "kesehatan",
  "beauty",
  "kecantikan",
  "travel",
  "wisata",
  "clinic",
  "klinik",
];

/**
 * Classifies a raw business category into one of the SEO template groups.
 * `businessName` is checked too (in addition to `rawCategory`) only for the
 * KOST bucket, because "kost" is not a distinct Geoapify taxonomy leaf — it
 * lives under the same accommodation.* branch as hotels, so the name is
 * often the only signal that separates it from HOTEL.
 */
export function classifyBusinessCategory(
  rawCategory: string | undefined | null,
  businessName?: string | null
): BusinessCategoryGroup {
  const cat = (rawCategory || "").toLowerCase();
  const name = (businessName || "").toLowerCase();

  if (KOST_KEYWORDS.some((k) => cat.includes(k) || name.includes(k))) return "KOST";
  if (RESTAURANT_KEYWORDS.some((k) => cat.includes(k))) return "RESTAURANT";
  if (HOTEL_KEYWORDS.some((k) => cat.includes(k))) return "HOTEL";
  if (RETAIL_KEYWORDS.some((k) => cat.includes(k))) return "RETAIL";
  if (SERVICE_KEYWORDS.some((k) => cat.includes(k))) return "SERVICE";
  return "OTHER";
}

export function businessLocationLabel(
  b: Pick<ApiBusinessDetail, "city" | "province">
): string {
  return b.city || b.province || "Indonesia";
}

/** Task 4: one unique, non-templated title per business. */
export function buildBusinessTitle(b: ApiBusinessDetail): string {
  const location = businessLocationLabel(b);
  return `${b.name} ${location} - Review, Rating & Informasi Lengkap | Katamereka`;
}

/**
 * Task 5: meta description varies by category group, never a single global
 * sentence. Falls back to a generic-but-still-business-specific line (never
 * another business's data) when the category doesn't match a known group.
 */
export function buildBusinessDescription(b: ApiBusinessDetail): string {
  const location = businessLocationLabel(b);
  const group = classifyBusinessCategory(b.category, b.name);
  const reviewCount = b.reviews_count ?? b.externalReviewsCount ?? 0;

  switch (group) {
    case "RESTAURANT":
      return `${b.name} ${location} - Baca ${reviewCount} ulasan pelanggan, lihat rating, menu, lokasi, fasilitas, dan pengalaman pengunjung sebelum datang.`;
    case "HOTEL":
      return `${b.name} ${location} - Temukan review tamu, rating, fasilitas, lokasi, dan informasi lengkap sebelum memilih tempat menginap.`;
    case "KOST":
      return `${b.name} ${location} - Lihat fasilitas, lokasi, pengalaman penghuni, dan review kost sebelum menentukan tempat tinggal.`;
    case "RETAIL":
      return `${b.name} ${location} - Baca pengalaman pelanggan, rating, lokasi, produk, dan informasi lengkap sebelum berbelanja.`;
    case "SERVICE":
      return `${b.name} ${location} - Lihat review pelanggan, kualitas layanan, lokasi, dan pengalaman pengguna sebelum menggunakan jasa.`;
    default:
      return `${b.name} ${location} - Temukan informasi bisnis, lokasi, kategori, dan pengalaman pengguna di Katamereka.`;
  }
}

/**
 * Task 7: schema.org @type varies by category group instead of always LocalBusiness.
 * Every returned type must be LocalBusiness or a subtype of it — Google's
 * Review snippet only accepts aggregateRating on supported parent types, and
 * plain "Service" is not one (it triggers `Invalid object type for field
 * "<parent_node>"`).
 */
export function businessSchemaType(group: BusinessCategoryGroup): string {
  switch (group) {
    case "RESTAURANT":
      return "Restaurant";
    case "HOTEL":
      return "Hotel";
    case "KOST":
      return "LodgingBusiness";
    case "RETAIL":
      return "Store";
    case "SERVICE":
    default:
      return "LocalBusiness";
  }
}

/**
 * Task 7: full JSON-LD entity for one business — never shared across businesses.
 * `reviews` (public, already-published) are nested as `review` so the entity
 * carries its own evidence; pass [] when none are loaded.
 */
export function buildBusinessSchema(
  b: ApiBusinessDetail,
  businessUrl: string,
  reviews: SchemaReviewInput[] = []
): Record<string, unknown> {
  const group = classifyBusinessCategory(b.category, b.name);
  const rawRating = b.averageRating ?? b.rating ?? b.externalRating;
  const parsedRating =
    typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating ?? ""));
  const ratingValue = Number.isFinite(parsedRating)
    ? Math.round(parsedRating * 10) / 10
    : undefined;
  const reviewCount = b.reviewCount ?? b.reviews_count ?? b.externalReviewsCount ?? 0;

  const images = Array.from(
    new Set(
      [
        b.coverUrl || b.cover_url,
        ...(Array.isArray(b.photos) ? b.photos.slice(0, 5) : []),
        b.logoUrl || b.logo_url,
      ]
        .map((u) => resolveMediaUrl(u))
        .filter(Boolean)
    )
  );

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": businessSchemaType(group),
    "@id": `${businessUrl}#business`,
    name: b.name,
    description: (b.description || "").trim() || buildBusinessDescription(b),
    url: businessUrl,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: b.city,
      addressRegion: b.province,
      ...(b.postalCode ? { postalCode: b.postalCode } : {}),
      addressCountry: b.country || "ID",
    },
  };

  if (b.phone) schema.telephone = b.phone;
  if (b.email) schema.email = b.email;
  if (b.website) schema.sameAs = [b.website];
  if (images.length > 0) schema.image = images;
  const priceRange = b.priceRange || b.price_range;
  if (priceRange) schema.priceRange = priceRange;
  if (group === "RESTAURANT" && b.catering?.cuisine) {
    schema.servesCuisine = b.catering.cuisine;
  }
  if (typeof b.latitude === "number" && typeof b.longitude === "number") {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude: b.latitude,
      longitude: b.longitude,
    };
  }
  // Only attach aggregateRating when there's at least one real review behind
  // it — markup with no backing reviews violates Google's structured data
  // guidelines and risks a manual action.
  if (ratingValue && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // NOTE: We intentionally do NOT attach an array of individual `Review` objects
  // (schema.review) alongside `aggregateRating`. In Google Search Console, having
  // multiple Review nodes nested within an entity that already defines aggregateRating
  // triggers the critical error "Review has multiple aggregate ratings", disqualifying
  // the page from star snippet rich results. Google's review snippet specification
  // for review platforms requires only a single, clean `aggregateRating`.
  return schema;
}
