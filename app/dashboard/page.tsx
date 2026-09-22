"use client"

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
import { RatingTrendChart } from "@/components/rating-trend-chart"
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
import { businessActivity } from "@/lib/mock/activity"
import { getNeedsAttentionReviews, getRatingDistribution, getReviewsByBusiness } from "@/lib/mock/reviews"
import { formatDate, timeAgo } from "@/lib/format"

const ACTIVITY_ICON = {
  reply: MessageCircleIcon,
  review: StarIcon,
  verification: ScrollTextIcon,
  team: ScrollTextIcon,
  report: ScrollTextIcon,
  invitation: ScrollTextIcon,
  evidence: ScrollTextIcon,
  business: ScrollTextIcon,
}

export default function DashboardOverviewPage() {
  const { selectedBusiness } = useBusinessContext()
  const { user } = useAuth()
  if (!selectedBusiness) return null

  const reviews = getReviewsByBusiness(selectedBusiness.id)
  const needsAttention = getNeedsAttentionReviews(selectedBusiness.id).slice(0, 5)
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
  const activity = businessActivity[selectedBusiness.id] ?? []
  const firstName = user?.name.split(" ")[0] ?? "Admin"

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Selamat datang kembali, {firstName}! 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ini adalah ringkasan performa {selectedBusiness.name} selama 30 hari terakhir.
          </p>
        </div>
        <DateRangeSelector />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Average Rating"
          value={selectedBusiness.averageRating.toFixed(1)}
          delta="+0.2 dari bulan lalu"
          icon={StarIcon}
          href="/dashboard/analytics"
        />
        <StatCard
          label="Total Reviews"
          value={selectedBusiness.totalReviews.toLocaleString("id-ID")}
          delta="+12% dari bulan lalu"
          icon={MessageCircleIcon}
          href="/dashboard/reviews"
        />
        <StatCard
          label="Review Baru"
          value={reviews.length}
          delta="+43% dari bulan lalu"
          icon={ScrollTextIcon}
          href="/dashboard/reviews"
        />
        <StatCard
          label="Response Rate"
          value={`${selectedBusiness.responseRate}%`}
          delta="+4% dari bulan lalu"
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
              centerValue={selectedBusiness.totalReviews.toLocaleString("id-ID")}
              centerLabel="Total Review"
              segments={[
                { label: "Dibalas", value: selectedBusiness.responseRate, color: "var(--color-primary)" },
                { label: "Belum Dibalas", value: 6, color: "#86efac" },
                { label: "Dilaporkan", value: 2, color: "var(--color-warning)" },
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
                  <TableHead>Issue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="pr-6 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {needsAttention.map((review) => (
                  <TableRow key={review.id} className="hover:bg-transparent">
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2.5">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {review.reviewerName
                              .split(" ")
                              .map((p) => p[0])
                              .slice(0, 2)
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {review.reviewerName}
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
                      {review.issue && <StatusBadge status={review.issue} />}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={review.reportCount > 0 ? "Dilaporkan" : "Belum Dibalas"} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {review.reportCount > 0 ? (
                        <Button variant="link" size="sm" render={<Link href="/dashboard/reviews" />}>
                          Lihat
                        </Button>
                      ) : (
                        <ReplyDialog review={review} triggerVariant="link" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {review.reviewerName}
                    </p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {timeAgo(review.createdAt)}
                    </span>
                  </div>
                  <RatingStars rating={review.rating} size="sm" className="mt-0.5" />
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    &ldquo;{review.content}&rdquo;
                  </p>
                </div>
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
          {activity.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada aktivitas terbaru.
            </p>
          )}
          {activity.map((item) => {
            const Icon = ACTIVITY_ICON[item.icon]
            return (
              <div key={item.id} className="flex items-center gap-3 text-sm">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="flex-1 text-foreground/90">{item.text}</span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(item.at)}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
