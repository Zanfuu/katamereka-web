/**
 * Server-only data loaders shared by /business/[slug] (layout, page) and
 * /business/[slug]/reviews, so metadata, JSON-LD and the visible HTML are all
 * built from the same single, cached fetch per request.
 *
 * Unlike fetchBusinessBySlug() these distinguish "does not exist" (404 -> null)
 * from "API is down" (throws). With ISR, a thrown error keeps serving the last
 * good page, whereas returning null on an outage would cache a 404 for a real
 * business and risk de-indexing it.
 */
import { cache } from "react";
import {
  API_BASE_URL,
  publicGetInit,
  type ApiBusinessDetail,
  type ApiReviewSummary,
} from "./api-client";
import type { SchemaReviewInput } from "./schema-org";

export type { ApiReviewSummary };

export interface PublicReview extends SchemaReviewInput {
  id: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  userId?: string;
  user?: { id?: string; name?: string; initials?: string };
  helpfulCount?: number;
  helpful_count?: number;
}

function safeDecode(slug: string): string {
  try {
    return decodeURIComponent(slug).trim();
  } catch {
    return slug.trim();
  }
}

export const getBusinessForSsr = cache(
  async (rawSlug: string): Promise<ApiBusinessDetail | null> => {
    const slug = safeDecode(rawSlug);
    const res = await fetch(
      `${API_BASE_URL}/businesses/slug/${encodeURIComponent(slug)}`,
      { headers: { "Content-Type": "application/json" }, ...publicGetInit(["businesses", `business:${slug}`]) }
    );
    // The deployed API currently answers 500 (not 404) for a slug that doesn't
    // exist, so 500 is treated as "not found" too; otherwise every garbage URL
    // a crawler tries would be a 5xx, which makes Googlebot throttle the site.
    // Gateway/availability errors (502/503/504) are real outages: throw so ISR
    // keeps serving the last good page instead of caching a 404.
    if (res.status === 404 || res.status === 500) return null;
    if (!res.ok) throw new Error(`GET /businesses/slug/${slug} responded ${res.status}`);
    const json = await res.json();
    return (json?.data as ApiBusinessDetail) ?? null;
  }
);

export const getBusinessReviewsForSsr = cache(
  async (businessId: string): Promise<PublicReview[]> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/reviews`,
        publicGetInit(["reviews", `reviews:${businessId}`])
      );
      if (!res.ok) return [];
      const json = await res.json();
      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.reviews)
          ? json.reviews
          : [];
      return list as PublicReview[];
    } catch {
      // Reviews are additive content; the profile itself must still render.
      return [];
    }
  }
);

export const getBusinessReviewSummaryForSsr = cache(
  async (businessId: string): Promise<ApiReviewSummary | null> => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/review-summary`,
        publicGetInit(["reviews", `reviews:${businessId}`, "review-summary"])
      );
      if (!res.ok) return null;
      return (await res.json()) as ApiReviewSummary;
    } catch {
      return null;
    }
  }
);

