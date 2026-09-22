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
import { StatusDonutChart } from "@/components/status-donut-chart"
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
  dailyReviewVolume30d,
  reviewSentimentBreakdown,
  reviewSourceBreakdown,
  topKeywords,
  topKeywordsNegative,
  topKeywordsPositive,
} from "@/lib/mock/analytics"
import { getRatingDistributionScaled, getReviewsByBusiness } from "@/lib/mock/reviews"

const volumeConfig: ChartConfig = { count: { label: "Review", color: "var(--color-primary)" } }

// Not backed by the small mock review list (only a handful of sample rows) —
// scaled to match the business's reputation-level numbers, same idea as
// Business.totalReviews.
const INVITATIONS_SENT = 2430
const INVITATION_RESPONSE_RATE = 52

export default function DashboardAnalyticsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [volumeFilter, setVolumeFilter] = React.useState<"all" | "verified" | "unverified">("all")
  const [keywordFilter, setKeywordFilter] = React.useState<"all" | "positive" | "negative">("all")

  if (!selectedBusiness) return null

  const reviews = getReviewsByBusiness(selectedBusiness.id)
  const keywordData =
    keywordFilter === "positive"
      ? topKeywordsPositive
      : keywordFilter === "negative"
        ? topKeywordsNegative
        : topKeywords
  const verifiedRatio =
    selectedBusiness.totalReviews > 0
      ? selectedBusiness.verifiedReviews / selectedBusiness.totalReviews
      : 0
  const volumeRatio =
    volumeFilter === "verified" ? verifiedRatio : volumeFilter === "unverified" ? 1 - verifiedRatio : 1
  const volumeData = dailyReviewVolume30d.map((point) => ({
    day: point.day,
    count: Math.max(1, Math.round(point.count * volumeRatio)),
  }))

  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

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
                  { metrik: "Total Reviews", nilai: selectedBusiness.totalReviews },
                  { metrik: "Undangan Terkirim", nilai: INVITATIONS_SENT },
                  { metrik: "Response Rate", nilai: `${INVITATION_RESPONSE_RATE}%` },
                  ...reviewSourceBreakdown.map((s) => ({ metrik: `Sumber: ${s.label}`, nilai: s.value })),
                  ...reviewSentimentBreakdown.map((s) => ({
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
          value={selectedBusiness.totalReviews.toLocaleString("id-ID")}
          delta="+12% dari bulan lalu"
          icon={MessageSquareTextIcon}
          iconTone="accent"
          href="/dashboard/reviews"
        />
        <StatCard
          label="Undangan Terkirim"
          value={INVITATIONS_SENT.toLocaleString("id-ID")}
          delta="+18% dari bulan lalu"
          icon={SendIcon}
          iconTone="accent"
          href="/dashboard/invitations"
        />
        <StatCard
          label="Response Rate"
          value={`${INVITATION_RESPONSE_RATE}%`}
          delta="+6% dari bulan lalu"
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
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} />
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
              distribution={getRatingDistributionScaled(selectedBusiness.id)}
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
              segments={reviewSourceBreakdown}
              centerValue={selectedBusiness.totalReviews.toLocaleString("id-ID")}
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
              segments={reviewSentimentBreakdown}
              centerValue={selectedBusiness.totalReviews.toLocaleString("id-ID")}
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
            {recentReviews.map((review) => (
              <div key={review.id} className="flex items-start gap-2.5">
                <Avatar size="sm">
                  <AvatarFallback>
                    {review.reviewerName
                      .split(" ")
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {review.reviewerName}
                  </p>
                  <RatingStars rating={review.rating} size="sm" className="mt-0.5" />
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {review.content}
                  </p>
                </div>
                <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                  <p>{formatDate(review.createdAt)}</p>
                  {review.source && <p>melalui {review.source}</p>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
