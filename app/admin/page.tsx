"use client"

import Link from "next/link"
import {
  HeartIcon,
  MessageCircleIcon,
  ShieldCheckIcon,
  StarIcon,
  UserPlusIcon,
} from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { PageHeader } from "@/components/page-header"
import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { RatingTrendChart } from "@/components/rating-trend-chart"
import { ReplyDialog } from "@/components/reply-dialog"
import { ReviewCard } from "@/components/review-card"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { businessActivity } from "@/lib/mock/activity"
import { getRatingDistribution, getReviewsByBusiness } from "@/lib/mock/reviews"
import { currentBusinessAdmin } from "@/lib/mock/session"
import { formatDate } from "@/lib/format"

const ACTIVITY_ICON = {
  reply: MessageCircleIcon,
  review: StarIcon,
  verification: ShieldCheckIcon,
  team: UserPlusIcon,
  report: HeartIcon,
}

export default function AdminOverviewPage() {
  const { selectedBusiness } = useBusinessContext()

  if (!selectedBusiness) return null

  const reviews = getReviewsByBusiness(selectedBusiness.id)
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  const recentReviews = sortedReviews.slice(0, 2)
  const needsAttention = reviews
    .filter(
      (review) => !review.reply || review.rating <= 2 || review.reportCount > 0
    )
    .slice(0, 3)
  const unrepliedCount = reviews.filter((review) => !review.reply).length
  const activity = businessActivity[selectedBusiness.id] ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Selamat datang kembali, ${currentBusinessAdmin.name.split(" ")[0]}`}
        description={`Kelola reputasi dan pengalaman customer ${selectedBusiness.name}.`}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Average Rating"
          value={selectedBusiness.averageRating.toFixed(1)}
          delta="+0.2 bulan ini"
          icon={StarIcon}
        />
        <StatCard
          label="Total Review"
          value={selectedBusiness.totalReviews.toLocaleString("id-ID")}
          delta="+48 bulan ini"
          icon={MessageCircleIcon}
        />
        <StatCard
          label="Review Baru"
          value={reviews.length}
          hint={`${unrepliedCount} belum dibalas`}
          deltaTone="neutral"
          icon={HeartIcon}
        />
        <StatCard
          label="Response Rate"
          value={`${selectedBusiness.responseRate}%`}
          delta="+4% bulan ini"
          icon={ShieldCheckIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performa Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistributionBars
              distribution={getRatingDistribution(selectedBusiness.id)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                actions={!review.reply ? <ReplyDialog review={review} /> : undefined}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Membutuhkan Perhatian</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {needsAttention.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada review yang membutuhkan perhatian saat ini.
              </p>
            )}
            {needsAttention.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {review.reviewerName}
                  </p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {review.content}
                  </p>
                </div>
                <Button variant="outline" size="sm" render={<Link href="/admin/reviews" />}>
                  Lihat Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {activity.map((item) => {
            const Icon = ACTIVITY_ICON[item.icon]
            return (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-foreground/90">{item.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDate(item.at)}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
