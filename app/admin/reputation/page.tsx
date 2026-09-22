"use client"

import { BadgeCheckIcon, ClockIcon, MessageSquareTextIcon, StarIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { PageHeader } from "@/components/page-header"
import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { RatingTrendChart } from "@/components/rating-trend-chart"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRatingDistribution, getReviewsByBusiness } from "@/lib/mock/reviews"

export default function AdminReputationPage() {
  const { selectedBusiness } = useBusinessContext()
  if (!selectedBusiness) return null

  const reviews = getReviewsByBusiness(selectedBusiness.id)
  const verifiedPct =
    reviews.length > 0
      ? Math.round((selectedBusiness.verifiedReviews / selectedBusiness.totalReviews) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rating & Reputasi"
        description="Gambaran kualitas reputasi bisnis kamu di KataMereka."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Average Rating"
          value={selectedBusiness.averageRating.toFixed(1)}
          icon={StarIcon}
        />
        <StatCard
          label="Total Reviews"
          value={selectedBusiness.totalReviews.toLocaleString("id-ID")}
          icon={MessageSquareTextIcon}
        />
        <StatCard
          label="Verified Reviews"
          value={`${verifiedPct}%`}
          hint={`${selectedBusiness.verifiedReviews.toLocaleString("id-ID")} review`}
          icon={BadgeCheckIcon}
        />
        <StatCard
          label="Response Rate"
          value={`${selectedBusiness.responseRate}%`}
          icon={ClockIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistributionBars distribution={getRatingDistribution(selectedBusiness.id)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingTrendChart />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Quality</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <QualityRow
              label="Verified Review"
              value={selectedBusiness.verifiedReviews}
              percentage={verifiedPct}
            />
            <QualityRow
              label="Unverified Review"
              value={selectedBusiness.totalReviews - selectedBusiness.verifiedReviews}
              percentage={100 - verifiedPct}
              tone="muted"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Performance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Response Time</span>
              <span className="text-sm font-medium text-foreground">2.4 jam</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Response Rate</span>
              <span className="text-sm font-medium text-foreground">
                {selectedBusiness.responseRate}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${selectedBusiness.responseRate}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QualityRow({
  label,
  value,
  percentage,
  tone = "primary",
}: {
  label: string
  value: number
  percentage: number
  tone?: "primary" | "muted"
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${tone === "primary" ? "bg-success" : "bg-chart-4"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground">
        {value.toLocaleString("id-ID")}
      </span>
    </div>
  )
}
