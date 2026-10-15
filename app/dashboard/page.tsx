"use client"

import * as React from "react"
import Link from "next/link"
import {
  MessageCircleIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  StarIcon,
} from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { DateRangeSelector } from "@/components/date-range-selector"
import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { RatingStars } from "@/components/rating-stars"
import { RatingTrendChart, type TrendPoint } from "@/components/rating-trend-chart"
import { ReplyDialog } from "@/components/reply-dialog"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { StatusDonutChart } from "@/components/status-donut-chart"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import {
  fetchDashboardOverview,
  fetchRatingTrend,
  fetchDashboardReviews,
  createReviewReply,
  type DashboardStatsOverview,
  type ApiDashboardReview,
} from "@/lib/api-business-dashboard"
import { formatDate, timeAgo } from "@/lib/format"
import type { RatingDistribution, Review } from "@/lib/types"

export default function DashboardOverviewPage() {
  const { selectedBusiness, isLoading } = useBusinessContext()
  const { user } = useAuth()

  const [range, setRange] = React.useState("30d")
  const [overview, setOverview] = React.useState<DashboardStatsOverview | null>(null)
  const [trendPoints, setTrendPoints] = React.useState<TrendPoint[]>([])
  const [recentReviews, setRecentReviews] = React.useState<ApiDashboardReview[]>([])
  const [needsAttention, setNeedsAttention] = React.useState<ApiDashboardReview[]>([])

  const loadData = React.useCallback(async () => {
    if (!selectedBusiness?.id || selectedBusiness.id === "default-empty-business") {
      setOverview(null)
      setTrendPoints([
        { period: "Minggu 1", rating: 0 },
        { period: "Minggu 2", rating: 0 },
        { period: "Minggu 3", rating: 0 },
        { period: "Minggu 4", rating: 0 },
      ])
      setRecentReviews([])
      setNeedsAttention([])
      return
    }

    try {
      const [ovData, trendData, reviewsData] = await Promise.all([
        fetchDashboardOverview(selectedBusiness.id, range),
        fetchRatingTrend(selectedBusiness.id, range),
        fetchDashboardReviews(selectedBusiness.id, { limit: 20, sort: "NEWEST" }),
      ])

      if (ovData) {
        setOverview(ovData)
      } else {
        setOverview(null)
      }

      if (trendData?.points && trendData.points.length > 0) {
        const mappedTrend = trendData.points.map((p, idx) => {
          let label = p.start
          if (trendData.bucket === "week") {
            label = `Minggu ${idx + 1}`
          } else if (trendData.bucket === "month") {
            const dt = new Date(p.start)
            label = dt.toLocaleDateString("id-ID", { month: "short" })
          } else if (trendData.bucket === "day") {
            const dt = new Date(p.start)
            label = dt.toLocaleDateString("id-ID", { weekday: "short" })
          }
          return {
            period: label,
            rating: p.average_rating ?? 0,
          }
        })
        setTrendPoints(mappedTrend)
      } else {
        setTrendPoints([
          { period: "Minggu 1", rating: 0 },
          { period: "Minggu 2", rating: 0 },
          { period: "Minggu 3", rating: 0 },
          { period: "Minggu 4", rating: 0 },
        ])
      }

      if (reviewsData?.data) {
        setRecentReviews(reviewsData.data.slice(0, 3))
        const attn = reviewsData.data
          .filter((r) => r.rating <= 3 || r.report_count > 0 || !r.reply)
          .slice(0, 5)
        setNeedsAttention(attn)
      } else {
        setRecentReviews([])
        setNeedsAttention([])
      }
    } catch (err) {
      console.warn("Failed to load dashboard dynamic data:", err)
    }
  }, [selectedBusiness?.id, range])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 animate-pulse">
        <div className="h-8 w-72 rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
          <div className="h-28 rounded-xl bg-muted" />
        </div>
      </div>
    )
  }

  if (!selectedBusiness) return null

  const firstName = user?.name ? user.name.split(" ")[0] : "Admin"

  // 1. Average Rating
  const avgRatingVal = overview?.stats?.average_rating?.value ?? selectedBusiness.averageRating ?? 0
  const deltaRating = overview?.stats?.average_rating?.delta
  const deltaRatingText =
    deltaRating !== null && deltaRating !== undefined && deltaRating !== 0
      ? `${deltaRating > 0 ? "+" : ""}${deltaRating} dari periode sebelumnya`
      : "0 dari periode sebelumnya"
  const deltaRatingTone =
    deltaRating && deltaRating > 0 ? "positive" : deltaRating && deltaRating < 0 ? "negative" : "neutral"

  // 2. Total Reviews
  const totalReviewsVal = overview?.stats?.total_reviews?.value ?? selectedBusiness.totalReviews ?? 0
  const deltaTotalReviews = overview?.stats?.total_reviews?.delta_pct
  const deltaTotalText =
    deltaTotalReviews !== null && deltaTotalReviews !== undefined && deltaTotalReviews !== 0
      ? `${deltaTotalReviews > 0 ? "+" : ""}${deltaTotalReviews}% dari periode sebelumnya`
      : "0% dari periode sebelumnya"
  const deltaTotalTone =
    deltaTotalReviews && deltaTotalReviews > 0 ? "positive" : deltaTotalReviews && deltaTotalReviews < 0 ? "negative" : "neutral"

  // 3. New Reviews
  const newReviewsVal = overview?.stats?.new_reviews?.value ?? 0
  const deltaNewReviews = overview?.stats?.new_reviews?.delta_pct
  const deltaNewText =
    deltaNewReviews !== null && deltaNewReviews !== undefined && deltaNewReviews !== 0
      ? `${deltaNewReviews > 0 ? "+" : ""}${deltaNewReviews}% dari periode sebelumnya`
      : "0% dari periode sebelumnya"
  const deltaNewTone =
    deltaNewReviews && deltaNewReviews > 0 ? "positive" : deltaNewReviews && deltaNewReviews < 0 ? "negative" : "neutral"

  // 4. Response Rate
  const responseRateVal = overview?.stats?.response_rate?.value ?? selectedBusiness.responseRate ?? 0
  const deltaResponseRate = overview?.stats?.response_rate?.delta
  const deltaResponseText =
    deltaResponseRate !== null && deltaResponseRate !== undefined && deltaResponseRate !== 0
      ? `${deltaResponseRate > 0 ? "+" : ""}${deltaResponseRate}% dari periode sebelumnya`
      : "0% dari periode sebelumnya"
  const deltaResponseTone =
    deltaResponseRate && deltaResponseRate > 0 ? "positive" : deltaResponseRate && deltaResponseRate < 0 ? "negative" : "neutral"

  // Rating Distribution
  const distData: RatingDistribution = {
    5: Number(overview?.rating_distribution?.["5"] ?? 0),
    4: Number(overview?.rating_distribution?.["4"] ?? 0),
    3: Number(overview?.rating_distribution?.["3"] ?? 0),
    2: Number(overview?.rating_distribution?.["2"] ?? 0),
    1: Number(overview?.rating_distribution?.["1"] ?? 0),
  }

  // Review Status
  const repliedCount = overview?.review_status?.replied ?? 0
  const unrepliedCount = overview?.review_status?.unreplied ?? 0
  const reportedCount = overview?.review_status?.reported ?? 0

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Selamat datang kembali, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ini adalah ringkasan performa {selectedBusiness.name} selama {range === "all" ? "semua waktu" : range}.
          </p>
        </div>
        <DateRangeSelector defaultValue={range} onChange={(val) => setRange(val.preset)} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Average Rating"
          value={avgRatingVal.toFixed(1)}
          delta={deltaRatingText}
          deltaTone={deltaRatingTone}
          icon={StarIcon}
          href="/dashboard/analytics"
        />
        <StatCard
          label="Total Reviews"
          value={totalReviewsVal.toLocaleString("id-ID")}
          delta={deltaTotalText}
          deltaTone={deltaTotalTone}
          icon={MessageCircleIcon}
          href="/dashboard/reviews"
        />
        <StatCard
          label="Review Baru"
          value={newReviewsVal.toLocaleString("id-ID")}
          delta={deltaNewText}
          deltaTone={deltaNewTone}
          icon={ScrollTextIcon}
          href="/dashboard/reviews"
        />
        <StatCard
          label="Response Rate"
          value={`${responseRateVal}%`}
          delta={deltaResponseText}
          deltaTone={deltaResponseTone}
          icon={RefreshCwIcon}
          href="/dashboard/analytics"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Performa Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingTrendChart
              data={trendPoints}
              period={range as any}
              onPeriodChange={(p) => setRange(p)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribusi Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistributionBars
              distribution={distData}
              valueDisplay="percentage"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Review</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonutChart
              centerValue={totalReviewsVal.toLocaleString("id-ID")}
              centerLabel="Total Review"
              segments={[
                { label: "Dibalas", value: repliedCount, color: "var(--color-primary)" },
                { label: "Belum Dibalas", value: unrepliedCount, color: "#86efac" },
                { label: "Dilaporkan", value: reportedCount, color: "var(--color-warning)" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Review Membutuhkan Perhatian
              <Badge variant="destructive" className="rounded-full">
                {needsAttention.length}
              </Badge>
            </CardTitle>
            <Button variant="link" size="sm" render={<Link href="/dashboard/reviews" />}>
              Lihat Semua →
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Pelanggan</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Issue / Ringkasan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsAttention.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Tidak ada review yang membutuhkan perhatian saat ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  needsAttention.map((review) => {
                    const reviewerName = review.user?.name || "Pelanggan"
                    const adaptedReview = {
                      id: review.id,
                      reviewerName,
                      rating: review.rating,
                      content: review.content,
                    }

                    return (
                      <TableRow key={review.id} className="hover:bg-transparent">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm">
                              <AvatarFallback>
                                {reviewerName
                                  .split(" ")
                                  .map((p) => p[0])
                                  .slice(0, 2)
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {reviewerName}
                              </p>
                              <p className="line-clamp-1 max-w-40 text-xs text-muted-foreground">
                                {review.content}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RatingStars rating={review.rating} size="sm" />
                        </TableCell>
                        <TableCell>
                          <span className="line-clamp-1 max-w-36 text-xs text-muted-foreground">
                            {review.title || review.content.slice(0, 30)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={
                              review.report_count > 0
                                ? "Dilaporkan"
                                : review.reply
                                ? "Dibalas"
                                : "Belum Dibalas"
                            }
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(review.created_at)}
                        </TableCell>
                        <TableCell className="pr-6 text-right">
                          {review.report_count > 0 ? (
                            <Button variant="link" size="sm" render={<Link href="/dashboard/reviews" />}>
                              Lihat
                            </Button>
                          ) : (
                            <ReplyDialog
                              review={adaptedReview}
                              triggerVariant="link"
                              onSubmit={async (content) => {
                                const res = await createReviewReply(selectedBusiness.id, review.id, content)
                                if (res.success) {
                                  loadData()
                                  return true
                                }
                                return false
                              }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Review Terbaru</CardTitle>
            <Button variant="link" size="sm" render={<Link href="/dashboard/reviews" />}>
              Lihat Semua →
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {recentReviews.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Belum ada review terbaru dari pelanggan.
              </p>
            ) : (
              recentReviews.map((review) => {
                const reviewerName = review.user?.name || "Pelanggan"
                return (
                  <div key={review.id} className="flex items-start gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback>
                        {reviewerName
                          .split(" ")
                          .map((p) => p[0])
                          .slice(0, 2)
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {reviewerName}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {timeAgo(review.created_at)}
                        </span>
                      </div>
                      <RatingStars rating={review.rating} size="sm" className="mt-0.5" />
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        &ldquo;{review.content}&rdquo;
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
