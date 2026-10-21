/**
 * Social media links for a business, as saved by the owner in the dashboard
 * (backend `social_media` jsonb: { instagram, facebook, tiktok, youtube, linkedin }).
 */

export type SocialPlatform = "instagram" | "tiktok" | "youtube" | "facebook" | "linkedin";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
}

// Display order on the profile card.
const PLATFORMS: { id: SocialPlatform; label: string; aliases: string[]; base: string }[] = [
  { id: "instagram", label: "Instagram", aliases: ["instagram", "ig"], base: "https://instagram.com/" },
  { id: "tiktok", label: "TikTok", aliases: ["tiktok", "tik_tok"], base: "https://tiktok.com/@" },
  { id: "youtube", label: "YouTube", aliases: ["youtube", "yt"], base: "https://youtube.com/@" },
  { id: "facebook", label: "Facebook", aliases: ["facebook", "fb"], base: "https://facebook.com/" },
  { id: "linkedin", label: "LinkedIn", aliases: ["linkedin"], base: "https://linkedin.com/company/" },
];

function toSafeUrl(raw: unknown, base: string): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value || value === "-") return null;

  // Bare handle ("@nama" / "nama") -> platform profile URL.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value)
    ? value
    : /^(www\.)?[a-z0-9-]+\.[a-z]{2,}/i.test(value)
      ? `https://${value}`
      : `${base}${value.replace(/^@/, "")}`;

  try {
    const url = new URL(candidate);
    // Only ever render http(s) links: the value comes from user input.
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function resolveSocialLinks(socialMedia: unknown): SocialLink[] {
  if (!socialMedia || typeof socialMedia !== "object" || Array.isArray(socialMedia)) return [];

  const entries = Object.entries(socialMedia as Record<string, unknown>).map(
    ([key, value]) => [key.trim().toLowerCase(), value] as const
  );

  const links: SocialLink[] = [];
  for (const p of PLATFORMS) {
    const hit = entries.find(([key]) => p.aliases.includes(key));
    const url = hit ? toSafeUrl(hit[1], p.base) : null;
    if (url) links.push({ platform: p.id, label: p.label, url });
  }
  return links;
}
