"use client"

import Link from "next/link"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
  BuildingIcon,
  CheckCircle2Icon,
  FlagIcon,
  SendIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
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
import { formatDate, formatNumber } from "@/lib/format"
import { platformActivity } from "@/lib/mock/activity"
import { adminAccounts } from "@/lib/mock/admins"
import { platformGrowth, reviewActivity7d } from "@/lib/mock/analytics"
import { businesses } from "@/lib/mock/businesses"
import { fraudFlags } from "@/lib/mock/fraud"
import { reports } from "@/lib/mock/reports"
import { reviews } from "@/lib/mock/reviews"
import { platformUsers } from "@/lib/mock/users"
import { verificationRequests } from "@/lib/mock/verifications"

const ACTIVITY_ICON = {
  reply: ShieldCheckIcon,
  review: StarIcon,
  verification: ShieldCheckIcon,
  team: UserCogIcon,
  report: FlagIcon,
  invitation: SendIcon,
}

const growthConfig: ChartConfig = {
  users: { label: "Users", color: "var(--color-chart-1)" },
  businesses: { label: "Businesses", color: "var(--color-chart-2)" },
  reviews: { label: "Reviews", color: "var(--color-chart-3)" },
}

const activityConfig: ChartConfig = {
  count: { label: "Review", color: "var(--color-chart-1)" },
}

interface NeedsAttentionItem {
  id: string
  item: string
  type: "Verification" | "Report" | "Moderation" | "Fraud"
  priority: "High" | "Medium" | "Low"
  status: string
  createdAt: string
  href: string
}

export default function AdminOverviewPage() {
  const verifiedBusinesses = businesses.filter((b) => b.verificationStatus === "VERIFIED")
  const pendingVerification = verificationRequests.filter((v) => v.status === "PENDING")
  const reportedReviews = reviews.filter((r) => r.reportCount > 0)
  const moderationQueue = reports.filter(
    (r) => r.status === "OPEN" || r.status === "UNDER_INVESTIGATION"
  )
  const openFraud = fraudFlags.filter((f) => f.status === "OPEN")
  const totalReviews = businesses.reduce((sum, b) => sum + b.totalReviews, 0)

  const needsAttention: NeedsAttentionItem[] = [
    ...pendingVerification.map((v): NeedsAttentionItem => ({
      id: v.id,
      item: v.businessName,
      type: "Verification",
      priority: "High",
      status: v.status,
      createdAt: v.submittedAt,
      href: "/admin/trust-safety",
    })),
    ...moderationQueue.map((r): NeedsAttentionItem => ({
      id: r.id,
      item: `${r.businessName} — ${r.reviewerName}`,
      type: r.status === "UNDER_INVESTIGATION" ? "Moderation" : "Report",
      priority: r.reviewRating === 1 ? "High" : "Medium",
      status: r.status,
      createdAt: r.createdAt,
      href: "/admin/trust-safety",
    })),
    ...openFraud.map((f): NeedsAttentionItem => ({
      id: f.id,
      item: f.entityLabel,
      type: "Fraud",
      priority: f.riskLevel === "HIGH" ? "High" : f.riskLevel === "MEDIUM" ? "Medium" : "Low",
      status: f.status,
      createdAt: f.detectedAt,
      href: "/admin/trust-safety",
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const columns: ResourceTableColumn<NeedsAttentionItem>[] = [
    { key: "item", header: "Item", render: (row) => <span className="font-medium text-foreground">{row.item}</span> },
    { key: "type", header: "Type", render: (row) => <StatusBadge status="gray" label={row.type} /> },
    {
      key: "priority",
      header: "Priority",
      render: (row) => (
        <StatusBadge
          status={row.priority === "High" ? "HIGH" : row.priority === "Medium" ? "MEDIUM" : "LOW"}
          label={row.priority}
        />
      ),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      key: "createdAt",
      header: "Created At",
      sortValue: (row) => row.createdAt,
      render: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" render={<Link href={row.href} />}>
            Review
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Platform Overview"
        description="Kondisi keseluruhan platform KataMereka saat ini."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Total Customers" value={adminAccounts.length} icon={UserCogIcon} />
        <StatCard label="Total Businesses" value={businesses.length} icon={BuildingIcon} />
        <StatCard
          label="Verified Businesses"
          value={verifiedBusinesses.length}
          icon={ShieldCheckIcon}
        />
        <StatCard label="Total Users" value={formatNumber(platformUsers.length)} icon={UsersIcon} />
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
          label="Pending Moderation"
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

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Needs Attention {needsAttention.length > 0 && `(${needsAttention.length})`}</CardTitle>
          <Button variant="outline" size="sm" render={<Link href="/admin/trust-safety" />}>
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          <ResourceTable
            data={needsAttention}
            columns={columns}
            getRowId={(row) => row.id}
            emptyTitle="Tidak ada item yang membutuhkan perhatian saat ini."
          />
        </CardContent>
      </Card>

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
