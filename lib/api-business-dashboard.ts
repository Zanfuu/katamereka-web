/**
 * Katamereka Business Admin Dashboard API Client
 * Covers: GET /my-businesses, the dashboard reviews endpoints under
 * /businesses/:businessId/dashboard/reviews and /businesses/:businessId/reviews/:reviewId/reply,
 * and the /businesses/:businessId/review-reports endpoints.
 */

import { API_BASE_URL, ApiBusinessDetail } from "./api-client"

function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const direct = localStorage.getItem("accessToken")
    if (direct) return direct

    const activeUser = localStorage.getItem("katamereka_active_user")
    if (activeUser) {
      const parsed = JSON.parse(activeUser)
      if (parsed?.accessToken) return parsed.accessToken
    }

    const match = document.cookie.match(/(?:^|;\s*)km_session=([^;]+)/)
    if (match?.[1]) return decodeURIComponent(match[1])

    return null
  } catch {
    return null
  }
}

function authHeaders(): HeadersInit {
  const token = getToken()
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export interface MyBusinessItem {
  id: string
  name: string
  slug: string
  role: "OWNER" | "ADMIN" | "MEMBER" | string
  is_claimed: boolean
  description?: string
  category?: string
  website?: string
  phone?: string
  email?: string
  logo?: string
  logo_url?: string
  cover?: string
  cover_url?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  postal_code?: string
  rating?: number
  averageRating?: number
  reviewCount?: number
  totalReviews?: number
  status?: string
  verificationStatus?: string
  sourceOfTruth?: string
  createdAt?: string
}

export async function fetchMyBusinesses(): Promise<MyBusinessItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/my-businesses`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.warn("fetchMyBusinesses failed:", e)
    return []
  }
}

export async function fetchMyBusinessDetail(id: string): Promise<ApiBusinessDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(id)}`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (!res.ok) return null
    const json = await res.json()
    return json?.data ?? null
  } catch (e) {
    console.warn("fetchMyBusinessDetail failed:", e)
    return null
  }
}

export interface UpdateBusinessProfilePayload {
  name?: string
  description?: string
  short_description?: string
  phone?: string
  email?: string
  website?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  category?: string
  photos?: string[]
  opening_hours?: Record<string, any>
  social_media?: Record<string, any>
}

export async function updateBusinessProfile(
  businessId: string,
  payload: UpdateBusinessProfilePayload
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/profile`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, message: json?.message || "Gagal memperbarui profil bisnis" }
    }
    return { success: true, message: json?.message || "Profil bisnis berhasil diperbarui", data: json?.data }
  } catch (err: any) {
    return { success: false, message: err?.message || "Terjadi kesalahan jaringan" }
  }
}

export async function uploadBusinessLogo(
  businessId: string,
  file: File
): Promise<{ success: boolean; url?: string; message: string }> {
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/logo`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, message: json?.message || "Gagal mengunggah logo" }
    }
    return {
      success: true,
      url: json?.url || json?.logoUrl || json?.data?.logoUrl,
      message: "Logo berhasil diperbarui",
    }
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal mengunggah logo" }
  }
}

export async function uploadBusinessCover(
  businessId: string,
  file: File
): Promise<{ success: boolean; url?: string; message: string }> {
  try {
    const token = getToken()
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/cover`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, message: json?.message || "Gagal mengunggah gambar sampul" }
    }
    return {
      success: true,
      url: json?.url || json?.coverUrl || json?.data?.coverUrl,
      message: "Gambar sampul berhasil diperbarui",
    }
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal mengunggah gambar sampul" }
  }
}

export async function deleteBusinessLogo(
  businessId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/logo`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, message: json?.message || "Gagal menghapus logo" }
    }
    return { success: true, message: json?.message || "Logo berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal menghapus logo" }
  }
}

export async function deleteBusinessCover(
  businessId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/cover`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    const json = await res.json()
    if (!res.ok) {
      return { success: false, message: json?.message || "Gagal menghapus cover" }
    }
    return { success: true, message: json?.message || "Cover berhasil dihapus" }
  } catch (err: any) {
    return { success: false, message: err?.message || "Gagal menghapus cover" }
  }
}

export type DashboardReviewReplyStatus = "ALL" | "REPLIED" | "UNREPLIED"
export type DashboardReviewSort = "NEWEST" | "OLDEST" | "HIGHEST" | "LOWEST"
export type DashboardReviewSource = "KATAMEREKA" | "GOOGLE" | "WEBSITE"

export interface DashboardReviewsQuery {
  page?: number
  limit?: number
  rating?: number
  reply_status?: DashboardReviewReplyStatus
  sort?: DashboardReviewSort
  verified?: boolean
  source?: DashboardReviewSource
  search?: string
  reported?: boolean
}

export interface ApiDashboardReview {
  id: string
  rating: number
  title: string | null
  content: string
  status: "PUBLISHED" | "HIDDEN" | "REMOVED"
  source: DashboardReviewSource
  is_verified: boolean
  report_count: number
  created_at: string
  user: { id?: string; name?: string }
  reply: {
    id: string
    content: string
    created_at: string
    author: { id?: string; name?: string } | null
  } | null
}

export interface ApiDashboardReviewsResponse {
  data: ApiDashboardReview[]
  pagination: { page: number; limit: number; total: number; total_pages: number }
}

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "all") {
      query.append(key, String(value))
    }
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ""
}

export async function fetchDashboardReviews(
  businessId: string,
  query: DashboardReviewsQuery = {}
): Promise<ApiDashboardReviewsResponse> {
  const qs = buildQuery({
    page: query.page,
    limit: query.limit,
    rating: query.rating,
    reply_status: query.reply_status,
    sort: query.sort ? (query.sort.toLowerCase() as any) : undefined,
    verified: query.verified,
    source: query.source,
    search: query.search,
    reported: query.reported,
  })

  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/dashboard/reviews${qs}`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        return data
      }
    }
  } catch (e) {
    console.warn("fetchDashboardReviews failed:", e)
  }

  // Fallback: Fetch from public business reviews endpoint if dashboard endpoint is unauthorized or empty
  try {
    const pubRes = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/reviews?limit=100`, {
      cache: "no-store",
    })
    if (pubRes.ok) {
      const pubJson = await pubRes.json()
      const rawList = Array.isArray(pubJson.data) ? pubJson.data : []
      if (rawList.length > 0) {
        let filtered: ApiDashboardReview[] = rawList.map((r: any): ApiDashboardReview => ({
          id: r.id,
          rating: Number(r.rating || 5),
          title: r.title || null,
          content: r.content || "",
          status: "PUBLISHED",
          source: (r.source?.toUpperCase() as DashboardReviewSource) || "KATAMEREKA",
          is_verified: true,
          report_count: 0,
          created_at: r.created_at || r.createdAt || new Date().toISOString(),
          user: {
            id: r.user?.id,
            name: r.user?.name || "Pelanggan KataMereka",
          },
          reply: r.business_reply || r.reply
            ? {
                id: r.business_reply?.id || r.reply?.id || `rep-${r.id}`,
                content: r.business_reply?.content || r.reply?.content || "",
                created_at: r.business_reply?.created_at || r.reply?.created_at || r.created_at,
                author: {
                  id: r.business_reply?.author?.id || r.reply?.author?.id,
                  name: r.business_reply?.author?.name || r.reply?.author?.name || "Admin Bisnis",
                },
              }
            : null,
        }))

        if (query.reply_status === "UNREPLIED") {
          filtered = filtered.filter((r) => !r.reply)
        } else if (query.reply_status === "REPLIED") {
          filtered = filtered.filter((r) => !!r.reply)
        }
        if (query.rating) {
          filtered = filtered.filter((r) => r.rating === query.rating)
        }
        if (query.search) {
          const s = query.search.toLowerCase()
          filtered = filtered.filter(
            (r) => r.content.toLowerCase().includes(s) || (r.user.name && r.user.name.toLowerCase().includes(s))
          )
        }

        return {
          data: filtered,
          pagination: {
            page: query.page ?? 1,
            limit: query.limit ?? 100,
            total: filtered.length,
            total_pages: 1,
          },
        }
      }
    }
  } catch (e) {
    console.warn("fallback public reviews failed:", e)
  }

  return {
    data: [],
    pagination: { page: query.page ?? 1, limit: query.limit ?? 10, total: 0, total_pages: 1 },
  }
}

export interface ApiReplyResponse {
  success: boolean
  message: string
  data?: { id: string; content: string; created_at: string; author: { id?: string; name?: string } }
}

export async function createReviewReply(
  businessId: string,
  reviewId: string,
  content: string
): Promise<ApiReplyResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
      { method: "POST", headers: authHeaders(), body: JSON.stringify({ content }) }
    )
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || "Gagal mengirim balasan" }
    return data
  } catch (e) {
    return { success: false, message: "Terjadi kesalahan koneksi ke server" }
  }
}

export async function updateReviewReply(
  businessId: string,
  reviewId: string,
  content: string
): Promise<ApiReplyResponse> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
      { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ content }) }
    )
    const data = await res.json()
    if (!res.ok) return { success: false, message: data.message || "Gagal memperbarui balasan" }
    return data
  } catch (e) {
    return { success: false, message: "Terjadi kesalahan koneksi ke server" }
  }
}

export interface ApiReviewReportsSummary {
  pending: number
  resolved: number
  total: number
}

export async function fetchReviewReportsSummary(businessId: string): Promise<ApiReviewReportsSummary> {
  try {
    const res = await fetch(`${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/review-reports/summary`, {
      headers: authHeaders(),
      cache: "no-store",
    })
    if (res.ok) return await res.json()
  } catch (e) {
    console.warn("fetchReviewReportsSummary failed:", e)
  }
  return { pending: 0, resolved: 0, total: 0 }
}

export interface DashboardStatsOverview {
  range: {
    key: string
    from?: string
    to?: string
  }
  stats: {
    average_rating: {
      value: number
      previous: number | null
      delta: number | null
    }
    total_reviews: {
      value: number
      previous: number | null
      delta_pct: number | null
    }
    new_reviews: {
      value: number
      previous: number | null
      delta_pct: number | null
    }
    response_rate: {
      value: number
      previous: number | null
      delta: number | null
    }
  }
  rating_distribution: Record<string, number>
  review_status: {
    replied: number
    unreplied: number
    reported: number
  }
}

export async function fetchDashboardOverview(
  businessId: string,
  range = "30d"
): Promise<DashboardStatsOverview | null> {
  if (!businessId || businessId === "default-empty-business") return null
  try {
    const res = await fetch(
      `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/dashboard/overview?range=${encodeURIComponent(range)}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    )
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn("fetchDashboardOverview failed:", err)
  }
  return null
}

export interface RatingTrendPoint {
  start: string
  average_rating: number | null
  review_count: number
}

export interface RatingTrendResponse {
  bucket: "day" | "week" | "month"
  points: RatingTrendPoint[]
}

export async function fetchRatingTrend(
  businessId: string,
  range = "30d"
): Promise<RatingTrendResponse | null> {
  if (!businessId || businessId === "default-empty-business") return null
  try {
    const res = await fetch(
      `${API_BASE_URL}/businesses/${encodeURIComponent(businessId)}/dashboard/rating-trend?range=${encodeURIComponent(range)}`,
      {
        headers: authHeaders(),
        cache: "no-store",
      }
    )
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn("fetchRatingTrend failed:", err)
  }
  return null
}
