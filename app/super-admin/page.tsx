"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  BuildingIcon,
  CheckCircle2Icon,
  FlagIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { platformActivity } from "@/lib/mock/activity"
import { platformGrowth, reviewActivity7d } from "@/lib/mock/analytics"
import { businesses } from "@/lib/mock/businesses"
import { reports } from "@/lib/mock/reports"
import { reviews } from "@/lib/mock/reviews"
import { adminAccounts } from "@/lib/mock/admins"
import { platformUsers } from "@/lib/mock/users"
import { verificationRequests } from "@/lib/mock/verifications"
import { formatDate, formatNumber } from "@/lib/format"

const ACTIVITY_ICON = {
  reply: ShieldCheckIcon,
  review: StarIcon,
  verification: ShieldCheckIcon,
  team: UserCogIcon,
  report: FlagIcon,
}

const growthConfig: ChartConfig = {
  users: { label: "Users", color: "var(--color-chart-1)" },
  businesses: { label: "Businesses", color: "var(--color-chart-2)" },
  reviews: { label: "Reviews", color: "var(--color-chart-3)" },
}

const activityConfig: ChartConfig = {
  count: { label: "Review", color: "var(--color-chart-1)" },
}

export default function SuperAdminOverviewPage() {
  const verifiedBusinesses = businesses.filter((b) => b.verificationStatus === "VERIFIED")
  const pendingVerification = verificationRequests.filter((v) => v.status === "PENDING")
  const reportedReviews = reviews.filter((r) => r.reportCount > 0)
  const moderationQueue = reports.filter(
    (r) => r.status === "OPEN" || r.status === "UNDER_INVESTIGATION"
  )
  const totalReviews = businesses.reduce((sum, b) => sum + b.totalReviews, 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Platform Overview"
        description="Kondisi keseluruhan platform KataMereka saat ini."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Total Business Admin" value={adminAccounts.length} icon={UserCogIcon} />
        <StatCard label="Total Users" value={formatNumber(platformUsers.length)} icon={UsersIcon} />
        <StatCard label="Total Businesses" value={businesses.length} icon={BuildingIcon} />
        <StatCard
          label="Verified Businesses"
          value={verifiedBusinesses.length}
          icon={ShieldCheckIcon}
        />
        <StatCard label="Total Reviews" value={formatNumber(totalReviews)} icon={StarIcon} />
        <StatCard
          label="Pending Verification"
          value={pendingVerification.length}
          deltaTone="neutral"
          icon={CheckCircle2Icon}
        />
        <StatCard
          label="Reported Reviews"
          value={reportedReviews.length}
          deltaTone="negative"
          icon={FlagIcon}
        />
        <StatCard
          label="Moderation Queue"
          value={moderationQueue.length}
          deltaTone="negative"
          icon={ShieldAlertIcon}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="aspect-auto h-64 w-full">
              <LineChart data={platformGrowth} margin={{ left: -20, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line dataKey="users" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line
                  dataKey="businesses"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line dataKey="reviews" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Activity</CardTitle>
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
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Verification Queue</CardTitle>
            <Button variant="outline" size="sm" render={<Link href="/super-admin/verifications" />}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {pendingVerification.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada pengajuan verifikasi yang menunggu.
              </p>
            )}
            {pendingVerification.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{request.businessName}</p>
                  <p className="text-xs text-muted-foreground">
                    Diajukan {formatDate(request.submittedAt)}
                  </p>
                </div>
                <StatusBadge status={request.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Moderation Queue</CardTitle>
            <Button variant="outline" size="sm" render={<Link href="/super-admin/moderation" />}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {moderationQueue.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Tidak ada review yang membutuhkan moderasi saat ini.
              </p>
            )}
            {moderationQueue.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{report.businessName}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {report.reviewExcerpt}
                  </p>
                </div>
                <StatusBadge status={report.moderationStatus} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {platformActivity.map((item) => {
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
