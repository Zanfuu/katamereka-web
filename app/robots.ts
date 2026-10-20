import type { MetadataRoute } from "next";
import { getRequestHost } from "@/lib/request-host";
import { CONSUMER_SITE_URL, BUSINESS_SITE_URL, isBusinessHost } from "@/lib/site-config";

const CONSUMER_DISALLOW = [
  "/login",
  "/signup",
  "/search",
  "/dashboard",
  "/admin",
  "/profile",
  "/saved",
  "/auth",
];

const BUSINESS_DISALLOW = [
  "/dashboard",
  "/login",
  "/signup",
  "/otp",
  "/settings",
  "/admin",
  "/profile",
  "/saved",
  "/auth",
];

// AI search / assistant crawlers. Allowed explicitly so katamereka.id shows up
// in AI answers. A bot with its own group ignores the "*" group entirely, so
// the same private-path disallow list must be repeated for each of them.
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = await getRequestHost();
  const isBusiness = isBusinessHost(host);
  const siteUrl = isBusiness ? BUSINESS_SITE_URL : CONSUMER_SITE_URL;

  const disallow = isBusiness ? BUSINESS_DISALLOW : CONSUMER_DISALLOW;

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_CRAWLERS, allow: ["/", "/llms.txt"], disallow },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
