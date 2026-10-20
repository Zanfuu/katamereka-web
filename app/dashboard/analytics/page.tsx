"use client"

import * as React from "react"
import Link from "next/link"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { DownloadIcon, MessageSquareTextIcon, SendIcon, StarIcon, UsersIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { DateRangeSelector } from "@/components/date-range-selector"
import { KeywordBarList } from "@/components/keyword-bar-list"
import { PageHeader } from "@/components/page-header"
import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { RatingStars } from "@/components/rating-stars"
import { RatingTrendChart } from "@/components/rating-trend-chart"
import { StatCard } from "@/components/stat-card"
import { StatusDonutChart, type DonutSegment } from "@/components/status-donut-chart"
import type { RatingDistribution } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { downloadCsv } from "@/lib/csv"
import { formatDate } from "@/lib/format"
import {
  fetchDashboardOverview,
  fetchDashboardReviews,
  fetchKeywordsAnalytics,
  type ApiDashboardReview,
  type DashboardStatsOverview,
  type KeywordsAnalyticsResponse,
} from "@/lib/api-business-dashboard"
import { getInvitationsByBusiness } from "@/lib/mock/invitations"

const volumeConfig: ChartConfig = { count: { label: "Review", color: "var(--color-primary)" } }

const POSITIVE_LEXICON = [
  "enak", "nyaman", "ramah", "bersih", "murah", "bagus", "cepat",
  "mantap", "puas", "lengkap", "luas", "adem", "asri", "rekomendasi",
  "lezat", "estetik", "sejuk", "terbaik", "wangi", "rapi", "keren",
  "profesional", "mantul", "suka", "hebat", "top", "worth it"
]

const NEGATIVE_LEXICON = [
  "mahal", "lama", "antri", "kotor", "panas", "sempit", "bising",
  "kecewa", "lambat", "dingin", "asin", "rusak", "bau", "kurang",
  "jutek", "berisik", "gelap", "becek", "buruk", "jelek", "parah"
]

const STOPWORDS = new Set([
  "dan", "di", "ke", "dari", "yang", "ini", "itu", "untuk", "pada",
  "dengan", "adalah", "saya", "kami", "kita", "sangat", "ada",
  "tidak", "gak", "nggak", "bisa", "sudah", "lagi", "mau", "atau",
  "juga", "ya", "yah", "nya", "saja", "tapi", "karena", "kalo", "kalau",
  "banget", "buat", "sama", "aja", "dalam", "bukan", "hanya", "oleh", "akan"
])

export default function DashboardAnalyticsPage() {
  const { selectedBusiness, isLoading } = useBusinessContext()
  const [volumeFilter, setVolumeFilter] = React.useState<"all" | "verified" | "unverified">("all")
  const [keywordFilter, setKeywordFilter] = React.useState<"all" | "positive" | "negative">("all")
  const [realReviews, setRealReviews] = React.useState<ApiDashboardReview[]>([])
  const [overview, setOverview] = React.useState<DashboardStatsOverview | null>(null)
  const [keywordsApi, setKeywordsApi] = React.useState<KeywordsAnalyticsResponse | null>(null)
  const [invitationsCount, setInvitationsCount] = React.useState<number>(0)
  const [dataLoading, setDataLoading] = React.useState(true)

  React.useEffect(() => {
    if (!selectedBusiness?.id || selectedBusiness.id === "default-empty-business") {
      setRealReviews([])
      setOverview(null)
      setKeywordsApi(null)
      setInvitationsCount(0)
      setDataLoading(false)
      return
    }

    setDataLoading(true)
    const invs = getInvitationsByBusiness(selectedBusiness.id)
    setInvitationsCount(invs.length)

    Promise.all([
      fetchDashboardReviews(selectedBusiness.id, { limit: 100, sort: "NEWEST" }),
      fetchDashboardOverview(selectedBusiness.id, "30d"),
      fetchKeywordsAnalytics(selectedBusiness.id),
    ])
      .then(([revData, ovData, kwData]) => {
        if (revData?.data) {
          setRealReviews(revData.data)
        } else {
          setRealReviews([])
        }
        if (ovData) {
          setOverview(ovData)
        }
        if (kwData) {
          setKeywordsApi(kwData)
        }
      })
      .catch((err) => {
        console.warn("Failed to load analytics dynamic data:", err)
      })
      .finally(() => {
        setDataLoading(false)
      })
  }, [selectedBusiness?.id])


  // Dynamic Response Rate calculation
  const responseRate = React.useMemo(() => {
    if (overview?.stats?.response_rate?.value !== undefined && overview?.stats?.response_rate?.value !== null) {
      return Math.round(overview.stats.response_rate.value)
    }
    if (realReviews.length > 0) {
      const replied = realReviews.filter((r) => !!r.reply).length
      return Math.round((replied / realReviews.length) * 100)
    }
    return 0
  }, [overview, realReviews])

  const responseRateDelta = React.useMemo(() => {
    if (overview?.stats?.response_rate?.delta !== undefined && overview?.stats?.response_rate?.delta !== null) {
      const d = overview.stats.response_rate.delta
      return `${d >= 0 ? "+" : ""}${d}% dari bulan lalu`
    }
    return responseRate > 0 ? `+${responseRate}% dari bulan lalu` : "0% dari bulan lalu"
  }, [overview, responseRate])

  // Dynamic Invitations count
  const invitationsSent = invitationsCount
  const invitationsDelta =
    invitationsCount > 0 ? `+${invitationsCount} undangan aktif` : "Belum ada undangan"

  // Dynamic Total Reviews count
  const totalReviewsCount = selectedBusiness ? selectedBusiness.totalReviews : realReviews.length

  // Dynamic Daily Volume chart (Jumlah Review per hari untuk 30 hari terakhir)
  const volumeData = React.useMemo(() => {
    const days: { day: string; dateStr: string; count: number }[] = []
    const now = new Date()

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayNum = d.getDate()
      const monthStr = d.toLocaleDateString("id-ID", { month: "short" })
      const dateStr = d.toISOString().split("T")[0]
      days.push({
        day: `${dayNum} ${monthStr}`,
        dateStr,
        count: 0,
      })
    }

    const filtered = realReviews.filter((r) => {
      if (volumeFilter === "verified") return r.is_verified === true
      if (volumeFilter === "unverified") return r.is_verified === false
      return true
    })

    for (const r of filtered) {
      if (!r.created_at) continue
      const rDateStr = new Date(r.created_at).toISOString().split("T")[0]
      const match = days.find((d) => d.dateStr === rDateStr)
      if (match) {
        match.count += 1
      }
    }

    return days.map(({ day, count }) => ({ day, count }))
  }, [realReviews, volumeFilter])

  // Dynamic Rating Distribution
  const ratingDistribution = React.useMemo<RatingDistribution>(() => {
    const dist: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (realReviews.length > 0) {
      for (const r of realReviews) {
        const rating = Math.min(5, Math.max(1, Math.round(r.rating || 5))) as 1 | 2 | 3 | 4 | 5
        dist[rating] += 1
      }
    } else if (overview?.rating_distribution) {
      for (let star = 1; star <= 5; star++) {
        dist[star as 1 | 2 | 3 | 4 | 5] = overview.rating_distribution[String(star)] || 0
      }
    }
    return dist
  }, [realReviews, overview])

  // Dynamic Source Breakdown
  const SOURCE_COLORS: Record<string, string> = {
    Google: "#3b82f6",
    Website: "#10b981",
    WhatsApp: "#22c55e",
    Lainnya: "#64748b",
  }

  const sourceBreakdown = React.useMemo<DonutSegment[]>(() => {
    if (realReviews.length === 0) {
      return [{ label: "Website", value: 0, color: "#10b981" }]
    }
    const counts: Record<string, number> = {}
    for (const r of realReviews) {
      const src = r.source === "KATAMEREKA" ? "Website" : r.source || "Website"
      counts[src] = (counts[src] || 0) + 1
    }
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      color: SOURCE_COLORS[label] || "#10b981",
    }))
  }, [realReviews])

  // Dynamic Sentiment Breakdown
  const sentimentBreakdown = React.useMemo<DonutSegment[]>(() => {
    if (realReviews.length === 0) {
      return [{ label: "Positif", value: 0, color: "#10b981" }]
    }
    let pos = 0
    let neu = 0
    let neg = 0
    for (const r of realReviews) {
      if (r.rating >= 4) pos++
      else if (r.rating === 3) neu++
      else neg++
    }
    const res: DonutSegment[] = []
    if (pos > 0) res.push({ label: "Positif", value: pos, color: "#10b981" })
    if (neu > 0) res.push({ label: "Netral", value: neu, color: "#f59e0b" })
    if (neg > 0) res.push({ label: "Negatif", value: neg, color: "#ef4444" })
    return res.length > 0 ? res : [{ label: "Positif", value: 0, color: "#10b981" }]
  }, [realReviews])

  // Dynamic Recent Reviews (up to 3)
  const recentReviews = React.useMemo(() => {
    return [...realReviews]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
  }, [realReviews])

  const keywordData = React.useMemo(() => {
    // Dynamic extraction directly from real reviews
    if (realReviews.length === 0) {
      return []
    }

    const posCounts: Record<string, number> = {}
    const negCounts: Record<string, number> = {}
    const allCounts: Record<string, number> = {}

    for (const r of realReviews) {
      const text = (r.content || "").toLowerCase().trim()
      if (!text) continue

      // Match positive lexicon
      for (const w of POSITIVE_LEXICON) {
        if (text.includes(w)) {
          posCounts[w] = (posCounts[w] || 0) + 1
          allCounts[w] = (allCounts[w] || 0) + 1
        }
      }

      // Match negative lexicon
      for (const w of NEGATIVE_LEXICON) {
        if (text.includes(w)) {
          negCounts[w] = (negCounts[w] || 0) + 1
          allCounts[w] = (allCounts[w] || 0) + 1
        }
      }

      // Tokenize individual words (clean up repeated letters like "bangettttt" -> "banget")
      const cleaned = text
        .replace(/([a-zA-Z])\1{2,}/g, "$1") // e.g. "bangettttt" -> "banget"
        .replace(/[^a-zA-Z0-9\s]/g, " ")

      const rawWords = cleaned
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !STOPWORDS.has(w))

      for (const w of rawWords) {
        allCounts[w] = (allCounts[w] || 0) + 1
        if (r.rating >= 4) {
          posCounts[w] = (posCounts[w] || 0) + 1
        } else if (r.rating <= 2) {
          negCounts[w] = (negCounts[w] || 0) + 1
        }
      }
    }

    let result: { label: string; count: number }[] = []
    if (keywordFilter === "positive") {
      result = Object.entries(posCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count }))
    } else if (keywordFilter === "negative") {
      result = Object.entries(negCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count }))
    } else {
      result = Object.entries(allCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count }))
    }

    return result
  }, [realReviews, keywordFilter])

  if (isLoading || dataLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 animate-pulse">
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-72 w-full rounded-xl bg-muted/60" />
      </div>
    )
  }

  if (!selectedBusiness) return null

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Analytics" }]} />

      <PageHeader
        title="Analytics"
        description="Lihat performa bisnis Anda berdasarkan data review, rating, dan aktivitas pelanggan."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <DateRangeSelector />
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(`analytics-${selectedBusiness.slug}.csv`, [
                  { metrik: "Average Rating", nilai: selectedBusiness.averageRating.toFixed(1) },
                  { metrik: "Total Reviews", nilai: totalReviewsCount },
                  { metrik: "Undangan Terkirim", nilai: invitationsSent },
                  { metrik: "Response Rate", nilai: `${responseRate}%` },
                  ...sourceBreakdown.map((s) => ({ metrik: `Sumber: ${s.label}`, nilai: s.value })),
                  ...sentimentBreakdown.map((s) => ({
                    metrik: `Sentimen: ${s.label}`,
                    nilai: s.value,
                  })),
                ])
              }
            >
              <DownloadIcon />
              Export Data
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Average Rating"
          value={selectedBusiness.averageRating.toFixed(1)}
          delta="+0.2 dari bulan lalu"
          icon={StarIcon}
          iconTone="accent"
        />
        <StatCard
          label="Total Reviews"
          value={totalReviewsCount.toLocaleString("id-ID")}
          delta={totalReviewsCount > 0 ? `+${totalReviewsCount} review aktif` : "0 review"}
          icon={MessageSquareTextIcon}
          iconTone="accent"
          href="/dashboard/reviews"
        />
        <StatCard
          label="Undangan Terkirim"
          value={invitationsSent.toLocaleString("id-ID")}
          delta={invitationsDelta}
          icon={SendIcon}
          iconTone="accent"
          href="/dashboard/invitations"
        />
        <StatCard
          label="Response Rate"
          value={`${responseRate}%`}
          delta={responseRateDelta}
          icon={UsersIcon}
          iconTone="accent"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tren Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingTrendChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jumlah Review</CardTitle>
            <CardDescription>Review yang diterima per hari.</CardDescription>
            <CardAction>
              <Select
                value={volumeFilter}
                onValueChange={(value) => setVolumeFilter(value as typeof volumeFilter)}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Review</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ChartContainer config={volumeConfig} className="aspect-auto h-56 w-full">
              <BarChart data={volumeData} margin={{ left: -20, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} interval={4} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} allowDecimals={false} />
                <ChartTooltip
                  content={<ChartTooltipContent indicator="line" labelKey="day" />}
                  formatter={(value) => [`${value} review`, ""]}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Rating</CardTitle>
            <CardDescription>Persentase jumlah review berdasarkan rating.</CardDescription>
          </CardHeader>
          <CardContent>
            <RatingDistributionBars
              distribution={ratingDistribution}
              valueDisplay="both"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sumber Review</CardTitle>
            <CardDescription>Platform tempat pelanggan memberikan review.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonutChart
              segments={sourceBreakdown}
              centerValue={totalReviewsCount.toLocaleString("id-ID")}
              centerLabel="Review"
              showCount
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sentimen Review</CardTitle>
            <CardDescription>Analisis sentimen dari ulasan pelanggan.</CardDescription>
          </CardHeader>
          <CardContent>
            <StatusDonutChart
              segments={sentimentBreakdown}
              centerValue={totalReviewsCount.toLocaleString("id-ID")}
              centerLabel="Review"
              showCount
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Kata Kunci</CardTitle>
            <CardDescription>Kata yang paling sering muncul dalam review.</CardDescription>
            <CardAction>
              <Select
                value={keywordFilter}
                onValueChange={(value) => setKeywordFilter(value as typeof keywordFilter)}
              >
                <SelectTrigger size="sm" className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Review</SelectItem>
                  <SelectItem value="positive">Review Positif</SelectItem>
                  <SelectItem value="negative">Review Negatif</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent>
            <KeywordBarList items={keywordData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Review Terbaru</CardTitle>
              <CardDescription>Review pelanggan terbaru untuk bisnis Anda.</CardDescription>
            </div>
            <Button variant="link" size="sm" render={<Link href="/dashboard/reviews" />}>
              Lihat Semua →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {recentReviews.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                Belum ada review pelanggan untuk bisnis ini.
              </p>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="flex items-start gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {(review.user?.name || "Pelanggan")
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {review.user?.name || "Pelanggan"}
                    </p>
                    <RatingStars rating={review.rating} size="sm" className="mt-0.5" />
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {review.content}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                    <p>{formatDate(review.created_at)}</p>
                    {review.source && <p>melalui {review.source}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
