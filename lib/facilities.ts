/**
 * Facility labels for the business profile "Fasilitas" card.
 *
 * Primary source is the backend's pre-normalized `facilitiesList`. When the API
 * is older/doesn't send it, derive the same list from the raw `facilities` /
 * `catering` payloads so the card still fills in. Mirrors
 * api_service/src/businesses/helpers/facilities.helper.ts.
 */

const FLAG_LABELS: Record<string, string> = {
  wifi: "Wi-Fi",
  internet_access: "Wi-Fi",
  wheelchair: "Akses Kursi Roda",
  parking: "Area Parkir",
  area_parkir: "Area Parkir",
  air_conditioning: "AC",
  ac: "AC",
  reception_24h: "Resepsionis 24 Jam",
  front_desk: "Resepsionis",
  restaurant: "Restoran",
  restoran: "Restoran",
  swimming_pool: "Kolam Renang",
  pool: "Kolam Renang",
  gym: "Pusat Kebugaran",
  fitness: "Pusat Kebugaran",
  toilets: "Toilet",
  toilet: "Toilet",
  smoking_area: "Area Merokok",
  takeaway: "Bawa Pulang",
  delivery: "Pesan Antar",
  outdoor_seating: "Tempat Duduk Outdoor",
  cctv: "CCTV",
  security: "Keamanan",
  musholla: "Musholla",
  mushola: "Musholla",
  meeting_room: "Ruang Rapat",
  breakfast: "Sarapan",
  tv: "TV",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Tunai",
  cards: "Kartu Debit/Kredit",
  credit_cards: "Kartu Kredit",
  debit_cards: "Kartu Debit",
  visa: "Visa",
  mastercard: "Mastercard",
  qris: "QRIS",
  contactless: "Pembayaran Nirsentuh",
};

const TRUTHY = new Set(["true", "yes", "y", "1", "limited", "designated", "free", "wlan", "wired"]);

function isTruthy(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return TRUTHY.has(value.trim().toLowerCase());
  return false;
}

function isMeaningful(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "" && value.trim() !== "-";
}

function addPayments(source: unknown, out: Set<string>) {
  if (!source) return;
  if (typeof source === "string") {
    if (isMeaningful(source)) {
      const label = PAYMENT_LABELS[source.trim().toLowerCase()];
      out.add(`Bayar: ${label ?? source.trim()}`);
    }
    return;
  }
  if (Array.isArray(source)) {
    source.forEach((s) => addPayments(s, out));
    return;
  }
  if (typeof source === "object") {
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
      const label = PAYMENT_LABELS[key.trim().toLowerCase()];
      if (label && isTruthy(value)) out.add(`Bayar: ${label}`);
    }
  }
}

function addFlags(source: unknown, out: Set<string>) {
  if (!source) return;
  if (Array.isArray(source)) {
    source.forEach((item) => {
      if (isMeaningful(item)) out.add(item.trim());
    });
    return;
  }
  if (typeof source === "string") {
    source
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && s !== "-")
      .forEach((s) => out.add(s));
    return;
  }
  if (typeof source !== "object") return;

  for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
    if (key === "payment_options" || key === "payment") {
      addPayments(value, out);
      continue;
    }
    const label = FLAG_LABELS[key.trim().toLowerCase().replace(/[\s-]+/g, "_")];
    if (label && isTruthy(value)) out.add(label);
  }
}

interface FacilitySource {
  facilitiesList?: unknown;
  facilities_list?: unknown;
  facilities?: unknown;
  facility?: unknown;
  fasilitas?: unknown;
  catering?: unknown;
}

export function resolveFacilities(detail: FacilitySource | null | undefined): string[] {
  if (!detail) return [];

  // 1. Backend-normalized list.
  const fromApi = detail.facilitiesList ?? detail.facilities_list;
  if (Array.isArray(fromApi)) {
    const clean = fromApi.filter(isMeaningful).map((s) => s.trim());
    if (clean.length > 0) return Array.from(new Set(clean));
  }

  // 2. Frontend fallback: derive from the raw payload.
  const out = new Set<string>();
  addFlags(detail.facilities ?? detail.facility ?? detail.fasilitas, out);
  addFlags(detail.catering, out);
  return Array.from(out);
}
