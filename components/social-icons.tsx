import type { SocialPlatform } from "@/lib/social-media";

const ICON_CLASS = "w-5 h-5";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={ICON_CLASS} aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden="true">
      <path d="M16.5 2h-3.2v13.6c0 1.5-1.2 2.7-2.7 2.7a2.7 2.7 0 01-2.7-2.7 2.7 2.7 0 012.7-2.7c.27 0 .53.04.78.11V9.7a6 6 0 00-.78-.05A5.9 5.9 0 004.7 15.6 5.9 5.9 0 0010.6 21.5a5.9 5.9 0 005.9-5.9V8.4a8.3 8.3 0 004.8 1.54V6.7a5 5 0 01-4.8-4.7z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={ICON_CLASS} aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14zM7.12 20.45H3.56V9h3.56v11.45z" />
    </svg>
  );
}

// Brand color per platform, used as the button background.
export const SOCIAL_STYLES: Record<SocialPlatform, { bg: string; Icon: () => React.ReactElement }> = {
  instagram: { bg: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af]", Icon: InstagramIcon },
  tiktok: { bg: "bg-black", Icon: TikTokIcon },
  youtube: { bg: "bg-[#FF0000]", Icon: YouTubeIcon },
  facebook: { bg: "bg-[#1877F2]", Icon: FacebookIcon },
  linkedin: { bg: "bg-[#0A66C2]", Icon: LinkedInIcon },
};
