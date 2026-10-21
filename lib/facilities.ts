/**
 * Owner-written "Fasilitas" description and items for the business profile card.
 *
 * Read from the business `facilities` field returned by the backend: either an
 * array of string tags, text itself, or an object holding it under `description` / `deskripsi` / `items`.
 * Returns null or empty array when there is nothing meaningful, which hides the card.
 */

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text === "" || text === "-" ? null : text;
}

export function resolveFacilitiesList(
  detail: { facilities?: unknown } | null | undefined
): string[] {
  const fac = detail?.facilities;
  if (!fac) return [];
  if (Array.isArray(fac)) {
    return fac
      .filter((item): item is string => typeof item === "string" && item.trim() !== "")
      .map((item) => item.trim());
  }
  if (typeof fac === "object" && fac !== null) {
    const obj = fac as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return (obj.items as unknown[])
        .filter((item): item is string => typeof item === "string" && item.trim() !== "")
        .map((item) => item.trim());
    }
  }
  return [];
}

export function resolveFacilitiesDescription(
  detail: { facilities?: unknown } | null | undefined
): string | null {
  const fac = detail?.facilities;
  if (!fac) return null;
  if (typeof fac === "string") return clean(fac);
  if (typeof fac === "object" && !Array.isArray(fac)) {
    const obj = fac as Record<string, unknown>;
    return clean(obj.description) ?? clean(obj.deskripsi);
  }
  return null;
}
