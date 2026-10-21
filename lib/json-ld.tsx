/**
 * Renders schema.org JSON-LD as <script type="application/ld+json">.
 *
 * JSON.stringify alone is NOT safe inside an inline <script>: a business name
 * or review containing "</script>" would close the tag early and let the rest
 * be parsed as HTML (stored XSS, since names/reviews are user-supplied). The
 * "<" escape below keeps the payload valid JSON while making that impossible.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), "g");
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), "g");

export function serializeJsonLd(data: unknown): string {
  // Drop null/empty values: schema.org properties should be omitted, not null
  // (the API returns city/province as null for some businesses).
  return JSON.stringify(data, (_key, value) => (value === null || value === "" ? undefined : value))
    .replace(/</g, "\\u003c")
    .replace(LINE_SEPARATOR, "\\u2028")
    .replace(PARAGRAPH_SEPARATOR, "\\u2029");
}

export function JsonLd({ data }: { data: object | object[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
    </>
  );
}
