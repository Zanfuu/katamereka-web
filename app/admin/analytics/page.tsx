"use client"

import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  BuildingIcon,
  MessageSquareTextIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"

import { DateRangeSelector } from "@/components/date-range-selector"
import { PageHeader } from "@/components/page-header"
import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { StatCard } from "@/components/stat-card"
import { StatusDonutChart } from "@/components/status-donut-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/format"
import { platformActivity } from "@/lib/mock/activity"
import { platformGrowth, reviewActivity7d } from "@/lib/mock/analytics"
import { businesses } from "@/lib/mock/businesses"
import { categories } from "@/lib/mock/categories"
import { reviews } from "@/lib/mock/reviews"
import { platformUsers } from "@/lib/mock/users"
import type { RatingDistribution } from "@/lib/types"

const growthConfig: ChartConfig = {
  users: { label: "Users", color: "var(--color-chart-1)" },
  businesses: { label: "Businesses", color: "var(--color-chart-2)" },
  reviews: { label: "Reviews", color: "var(--color-chart-3)" },
}

const activityConfig: ChartConfig = {
  count: { label: "Review", color: "var(--color-chart-1)" },
}

const DONUT_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
]

function PlatformTab() {
  const verifiedBusinesses = businesses.filter((b) => b.verificationStatus === "VERIFIED").length

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Total Users" value={formatNumber(platformUsers.length)} icon={UsersIcon} />
        <StatCard label="Total Businesses" value={businesses.length} icon={BuildingIcon} />
        <StatCard label="Verified Businesses" value={verifiedBusinesses} icon={BuildingIcon} />
        <StatCard
          label="Total Reviews"
          value={formatNumber(businesses.reduce((sum, b) => sum + b.totalReviews, 0))}
          icon={StarIcon}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User, Business & Review Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={growthConfig} className="aspect-auto h-72 w-full">
            <LineChart data={platformGrowth} margin={{ left: -20, right: 12, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Line dataKey="users" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line dataKey="businesses" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              <Line dataKey="reviews" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {platformActivity.slice(0, 6).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-foreground/90">{item.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.at.slice(0, 10)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function ReviewsTab() {
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0
  const verifiedRatio = totalReviews > 0 ? (reviews.filter((r) => r.isVerified).length / totalReviews) * 100 : 0
  const reportRate = totalReviews > 0 ? (reviews.filter((r) => r.reportCount > 0).length / totalReviews) * 100 : 0
  const removedRate = totalReviews > 0 ? (reviews.filter((r) => r.status === "REMOVED").length / totalReviews) * 100 : 0

  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    distribution[r.rating] += 1
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Average Rating" value={avgRating.toFixed(1)} icon={StarIcon} />
        <StatCard label="Verified Ratio" value={`${verifiedRatio.toFixed(0)}%`} />
        <StatCard label="Report Rate" value={`${reportRate.toFixed(0)}%`} deltaTone="negative" />
        <StatCard label="Removed Rate" value={`${removedRate.toFixed(0)}%`} deltaTone="negative" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Volume (7 Hari)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityConfig} className="aspect-auto h-64 w-full">
              <BarChart data={reviewActivity7d} margin={{ left: -20, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={30} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="count" fill="var(--color-chart-1)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistributionBars distribution={distribution} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BusinessesTab() {
  const active = businesses.filter((b) => b.status === "ACTIVE").length
  const verified = businesses.filter((b) => b.verificationStatus === "VERIFIED").length
  const newThisMonth = businesses.filter((b) => b.createdAt >= "2026-09-01").length

  const categorySegments = categories
    .filter((c) => c.businessCount > 0)
    .map((c, index) => ({
      label: c.name,
      value: c.businessCount,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }))

  const byProvince = new Map<string, number>()
  businesses.forEach((b) => {
    byProvince.set(b.province, (byProvince.get(b.province) ?? 0) + 1)
  })
  const locationSegments = Array.from(byProvince.entries()).map(([label, value], index) => ({
    label,
    value,
    color: DONUT_COLORS[index % DONUT_COLORS.length],
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="New Businesses" value={newThisMonth} hint="Bulan ini" />
        <StatCard label="Active Businesses" value={active} />
        <StatCard label="Verified Businesses" value={verified} />
        <StatCard label="Total Businesses" value={businesses.length} icon={BuildingIcon} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonutChart
              segments={categorySegments}
              centerValue={String(businesses.length)}
              centerLabel="Businesses"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Location Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonutChart
              segments={locationSegments}
              centerValue={String(byProvince.size)}
              centerLabel="Provinces"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsersTab() {
  const active = platformUsers.filter((u) => u.status === "ACTIVE").length
  const activeReviewers = platformUsers.filter((u) => u.reviewCount > 0).length
  const newThisMonth = platformUsers.filter((u) => u.joinedAt >= "2026-09-01").length
  const totalContribution = platformUsers.reduce((sum, u) => sum + u.reviewCount, 0)

  const topContributors = [...platformUsers]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="New Users" value={newThisMonth} hint="Bulan ini" />
        <StatCard label="Active Users" value={active} />
        <StatCard label="Active Reviewers" value={activeReviewers} />
        <StatCard label="Review Contribution" value={formatNumber(totalContribution)} icon={MessageSquareTextIcon} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Review Contributors</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {topContributors.map((user) => (
            <div key={user.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="font-medium text-foreground">{user.reviewCount} review</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Platform Analytics"
        description="Insight pertumbuhan dan performa platform KataMereka."
        action={<DateRangeSelector />}
      />

      <Tabs defaultValue="platform">
        <TabsList>
          <TabsTrigger value="platform">Platform</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="platform" className="mt-4">
          <PlatformTab />
        </TabsContent>
        <TabsContent value="reviews" className="mt-4">
          <ReviewsTab />
        </TabsContent>
        <TabsContent value="businesses" className="mt-4">
          <BusinessesTab />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
