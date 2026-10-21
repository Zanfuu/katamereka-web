/**
 * Owner-written "Fasilitas" description for the business profile card.
 *
 * Read from the business `facilities` field returned by the backend: either the
 * text itself, or an object holding it under `description` / `deskripsi`.
 * Returns null when there is nothing meaningful, which hides the card.
 */

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text === "" || text === "-" ? null : text;
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
