import type { Metadata } from "next";
import { CONSUMER_SITE_URL } from "./site-config";

export const DEFAULT_OG_IMAGE = `${CONSUMER_SITE_URL}/logo.png`;

/**
 * Next.js shallow-merges `openGraph`/`twitter` — a page that sets its own
 * `openGraph` REPLACES the layout's entirely instead of inheriting siteName,
 * locale or images. So every public route builds its social metadata from
 * here, which guarantees title/description/canonical/og:image/twitter are
 * always emitted together and always server-rendered.
 */
export function buildPageMetadata(opts: {
  title: string;
  description: string;
  /** Absolute canonical URL. */
  url: string;
  /** Absolute image URL; falls back to the site logo. */
  image?: string | null;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const image = opts.image || DEFAULT_OG_IMAGE;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.url },
    ...(opts.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.url,
      siteName: "Katamereka",
      locale: "id_ID",
      type: opts.type ?? "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
  };
}
