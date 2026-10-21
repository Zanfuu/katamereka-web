/**
 * "Lanjut dari aktivitas terakhir" data source.
 *
 * Backend first (logged-in users): GET /search-history + GET /my-recently-viewed,
 * cleared via DELETE on both. If the user is a guest or the backend is
 * unreachable, falls back to a localStorage copy recorded in this browser.
 */

import { API_BASE_URL } from "./api-client";
import { formatRelativeDate } from "./api-profile";

export interface RecentActivity {
  id: string;
  type: "search" | "business";
  title: string;
  subtitle: string;
  href: string;
  imageUrl?: string | null;
  at: string; // ISO timestamp, used for ordering
}

const STORAGE_KEY = "km_recent_activity";
const MAX_LOCAL_ITEMS = 20;
const DEFAULT_DISPLAY_LIMIT = 4;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("accessToken");
  } catch {
    return null;
  }
}

function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ---------- local (FE fallback) store ----------

function readLocal(): RecentActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(items: RecentActivity[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_LOCAL_ITEMS)));
  } catch {
    /* storage full / blocked: history is best-effort */
  }
}

function upsertLocal(item: RecentActivity) {
  const rest = readLocal().filter((x) => x.id !== item.id);
  writeLocal([item, ...rest]);
}

function searchHref(query: string) {
  return `/search?q=${encodeURIComponent(query)}`;
}

function searchSubtitle(at: string) {
  return `Dicari ${formatRelativeDate(at).toLowerCase()}`;
}

function viewSubtitle(at: string) {
  return `Dilihat ${formatRelativeDate(at).toLowerCase()}`;
}

// ---------- recording ----------

export function recordSearchActivity(query: string) {
  const q = query.trim();
  if (!q) return;
  const at = new Date().toISOString();
  upsertLocal({
    id: `search:${q.toLowerCase()}`,
    type: "search",
    title: q,
    subtitle: searchSubtitle(at),
    href: searchHref(q),
    at,
  });

  const token = getToken();
  if (!token) return;
  fetch(`${API_BASE_URL}/search-history`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ query: q }),
  }).catch(() => {
    /* fire-and-forget; local copy already saved */
  });
}

export function recordBusinessViewActivity(business: {
  slug: string;
  name: string;
  imageUrl?: string | null;
}) {
  if (!business.slug || !business.name) return;
  const at = new Date().toISOString();
  upsertLocal({
    id: `business:${business.slug}`,
    type: "business",
    title: business.name,
    subtitle: viewSubtitle(at),
    href: `/business/${business.slug}`,
    imageUrl: business.imageUrl ?? null,
    at,
  });
  // BE view is already recorded by recordBusinessView() (POST /businesses/:id/view).
}

// ---------- reading ----------

async function getJson(path: string, token: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { headers: authHeaders(token), cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRecentActivities(limit = DEFAULT_DISPLAY_LIMIT): Promise<RecentActivity[]> {
  const token = getToken();

  if (token) {
    const [searches, views] = await Promise.all([
      getJson(`/search-history?limit=${limit}`, token),
      getJson(`/my-recently-viewed?limit=${limit}`, token),
    ]);

    // Either call answering means the backend is reachable: trust it, even when empty.
    if (searches || views) {
      const items: RecentActivity[] = [];

      for (const s of Array.isArray(searches?.data) ? searches.data : []) {
        const at = s.updatedAt || s.createdAt;
        if (!s.query || !at) continue;
        items.push({
          id: `search:${String(s.query).toLowerCase()}`,
          type: "search",
          title: s.query,
          subtitle: searchSubtitle(at),
          href: searchHref(s.query),
          at,
        });
      }

      for (const b of Array.isArray(views?.data) ? views.data : []) {
        const at = b.viewed_at || b.viewedAt;
        if (!b.slug || !b.name || !at) continue;
        items.push({
          id: `business:${b.slug}`,
          type: "business",
          title: b.name,
          subtitle: viewSubtitle(at),
          href: `/business/${b.slug}`,
          imageUrl: b.logo_url || b.logoUrl || b.cover_url || b.coverUrl || null,
          at,
        });
      }

      return items
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, limit);
    }
  }

  // Guest, or backend unreachable: use what this browser recorded.
  return readLocal()
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit)
    .map((item) => ({
      ...item,
      subtitle: item.type === "search" ? searchSubtitle(item.at) : viewSubtitle(item.at),
    }));
}

// ---------- clearing ----------

export async function clearRecentActivities(): Promise<void> {
  writeLocal([]);

  const token = getToken();
  if (!token) return;
  await Promise.all([
    fetch(`${API_BASE_URL}/search-history`, { method: "DELETE", headers: authHeaders(token) }).catch(() => null),
    fetch(`${API_BASE_URL}/my-recently-viewed`, { method: "DELETE", headers: authHeaders(token) }).catch(() => null),
  ]);
}
