"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  BuildingIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  FileWarningIcon,
  FlagIcon,
  MessageSquareTextIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { DateRangeSelector } from "@/components/date-range-selector"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { StatusDonutChart } from "@/components/status-donut-chart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate, timeAgo } from "@/lib/format"
import { platformActivity } from "@/lib/mock/activity"
import { adminAccounts } from "@/lib/mock/admins"
import { platformGrowth, reviewActivity30d } from "@/lib/mock/analytics"
import { businesses } from "@/lib/mock/businesses"
import { fraudFlags } from "@/lib/mock/fraud"
import { reports } from "@/lib/mock/reports"
import { reviews } from "@/lib/mock/reviews"
import { platformUsers } from "@/lib/mock/users"
import { verificationRequests } from "@/lib/mock/verifications"

const ACTIVITY_ICON: Record<string, { icon: typeof MessageSquareTextIcon; tone: string }> = {
  reply: { icon: MessageSquareTextIcon, tone: "bg-info/10 text-info" },
  review: { icon: StarIcon, tone: "bg-warning/10 text-warning" },
  verification: { icon: ShieldCheckIcon, tone: "bg-primary/10 text-primary" },
  team: { icon: UserCogIcon, tone: "bg-purple-100 text-purple-700" },
  report: { icon: FlagIcon, tone: "bg-destructive/10 text-destructive" },
  invitation: { icon: ClipboardListIcon, tone: "bg-info/10 text-info" },
  evidence: { icon: FileWarningIcon, tone: "bg-info/10 text-info" },
  business: { icon: BuildingIcon, tone: "bg-primary/10 text-primary" },
}

const growthConfig: ChartConfig = {
  users: { label: "Users", color: "var(--color-chart-1)" },
  businesses: { label: "Businesses", color: "var(--color-chart-2)" },
  reviews: { label: "Reviews", color: "var(--color-chart-3)" },
}

const activityConfig: ChartConfig = {
  reviewBaru: { label: "Review Baru", color: "var(--color-primary)" },
  reviewDilaporkan: { label: "Review Dilaporkan", color: "var(--color-destructive)" },
}

const GROWTH_PERIODS = ["6 Bulan Terakhir", "12 Bulan Terakhir"]
const ACTIVITY_PERIODS = ["30 Hari Terakhir", "90 Hari Terakhir"]

interface NeedsAttentionItem {
  id: string
  item: string
  type: "Verification" | "Report" | "Moderation" | "Fraud"
  priority: "High" | "Medium" | "Low"
  status: string
  createdAt: string
  href: string
}

function PeriodDropdown({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          />
        }
      >
        {value}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((option) => (
          <DropdownMenuItem key={option} onClick={() => onChange(option)}>
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function AdminOverviewPage() {
  const [growthPeriod, setGrowthPeriod] = React.useState(GROWTH_PERIODS[0])
  const [activityPeriod, setActivityPeriod] = React.useState(ACTIVITY_PERIODS[0])

  const verifiedBusinesses = businesses.filter((b) => b.verificationStatus === "VERIFIED")
  const pendingVerification = verificationRequests.filter((v) => v.status === "PENDING")
  const reportedReviews = reviews.filter((r) => r.reportCount > 0)
  const moderationQueue = reports.filter(
    (r) => r.status === "OPEN" || r.status === "UNDER_INVESTIGATION"
  )
  const openFraud = fraudFlags.filter((f) => f.status === "OPEN")
  const totalReviews = businesses.reduce((sum, b) => sum + b.totalReviews, 0)

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  reviews.forEach((r) => {
    ratingDistribution[r.rating] += 1
  })
  const ratingSegments = [
    { label: "5 Bintang", value: ratingDistribution[5], color: "#16A34A" },
    { label: "4 Bintang", value: ratingDistribution[4], color: "#4ADE80" },
    { label: "3 Bintang", value: ratingDistribution[3], color: "#FACC15" },
    { label: "2 Bintang", value: ratingDistribution[2], color: "#FB923C" },
    { label: "1 Bintang", value: ratingDistribution[1], color: "#EF4444" },
  ]

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

  const needsAttentionColumns: ResourceTableColumn<NeedsAttentionItem>[] = [
    {
      key: "item",
      header: "Item",
      render: (row) => <span className="font-medium text-foreground">{row.item}</span>,
    },
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
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" render={<Link href={row.href} />}>
            Review
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <ScrollTextIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={row.href} />}>Lihat Detail</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/admin/audit-logs" />}>Lihat Audit Log</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const recentBusinesses = [...businesses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Selamat datang, Super Admin!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Berikut adalah ringkasan kondisi platform KataMereka hari ini.
          </p>
        </div>
        <DateRangeSelector />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Customers"
          sublabel="Business Admin"
          value={adminAccounts.length.toLocaleString("id-ID")}
          delta="+12%"
          hint="dari bulan lalu"
          icon={UserCogIcon}
          href="/admin/customers"
        />
        <StatCard
          label="Total Businesses"
          value={businesses.length.toLocaleString("id-ID")}
          delta="+8%"
          hint="dari bulan lalu"
          icon={BuildingIcon}
          href="/admin/businesses"
        />
        <StatCard
          label="Verified Businesses"
          value={verifiedBusinesses.length.toLocaleString("id-ID")}
          delta="+15%"
          hint="dari bulan lalu"
          icon={ShieldCheckIcon}
          href="/admin/businesses"
        />
        <StatCard
          label="Total Users"
          value={platformUsers.length.toLocaleString("id-ID")}
          delta="+18%"
          hint="dari bulan lalu"
          icon={UsersIcon}
          href="/admin/users"
        />
        <StatCard
          label="Total Reviews"
          value={totalReviews.toLocaleString("id-ID")}
          delta="+22%"
          hint="dari bulan lalu"
          icon={StarIcon}
          href="/admin/reviews"
        />
        <StatCard
          label="Pending Verification"
          value={pendingVerification.length}
          delta="-28%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={ClipboardListIcon}
          href="/admin/trust-safety"
        />
        <StatCard
          label="Reported Reviews"
          value={reportedReviews.length}
          delta="+7%"
          hint="dari bulan lalu"
          icon={FlagIcon}
          iconTone="destructive"
          href="/admin/trust-safety"
        />
        <StatCard
          label="Pending Moderation"
          value={moderationQueue.length}
          delta="-14%"
          deltaTone="negative"
          hint="dari bulan lalu"
          icon={ShieldAlertIcon}
          iconTone="warning"
          href="/admin/trust-safety"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pertumbuhan Platform</CardTitle>
            <PeriodDropdown options={GROWTH_PERIODS} value={growthPeriod} onChange={setGrowthPeriod} />
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--color-chart-1)]" /> Users
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--color-chart-2)]" /> Businesses
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--color-chart-3)]" /> Reviews
              </span>
            </div>
            <ChartContainer config={growthConfig} className="aspect-auto h-64 w-full">
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

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktivitas Review</CardTitle>
            <PeriodDropdown options={ACTIVITY_PERIODS} value={activityPeriod} onChange={setActivityPeriod} />
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary" /> Review Baru
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-destructive" /> Review Dilaporkan
              </span>
            </div>
            <ChartContainer config={activityConfig} className="aspect-auto h-64 w-full">
              <BarChart data={reviewActivity30d} margin={{ left: -20, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="reviewBaru" fill="var(--color-primary)" radius={4} />
                <Bar dataKey="reviewDilaporkan" fill="var(--color-destructive)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Distribusi Rating (Semua Bisnis)</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusDonutChart
              segments={ratingSegments}
              centerValue={totalReviews.toLocaleString("id-ID")}
              centerLabel="Total Review"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Needs Attention
              {needsAttention.length > 0 && (
                <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                  {needsAttention.length}
                </span>
              )}
            </CardTitle>
            <Button variant="link" size="sm" render={<Link href="/admin/trust-safety" />}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="px-0">
            <div className="px-6">
              <ResourceTable
                data={needsAttention.slice(0, 5)}
                columns={needsAttentionColumns}
                getRowId={(row) => row.id}
                pageSizeOptions={[5]}
                emptyTitle="Tidak ada item yang membutuhkan perhatian."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Business Terbaru</CardTitle>
            <Button variant="link" size="sm" render={<Link href="/admin/businesses" />}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentBusinesses.map((business) => (
              <Link
                key={business.id}
                href={`/admin/businesses/${business.id}`}
                className="flex items-center justify-between gap-3 rounded-lg p-1.5 text-sm hover:bg-muted"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{business.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{business.slug}</p>
                </div>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                  {business.category}
                </span>
                <StatusBadge status={business.status} />
                <span className="hidden shrink-0 text-xs text-muted-foreground md:inline">
                  {formatDate(business.createdAt)}
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <Button variant="link" size="sm" render={<Link href="/admin/audit-logs" />}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {platformActivity.map((item) => {
              const { icon: Icon, tone } = ACTIVITY_ICON[item.icon] ?? {
                icon: CalendarClockIcon,
                tone: "bg-accent text-accent-foreground",
              }
              return (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${tone}`}>
                    <Icon className="size-4" />
                  </span>
                  <span className="flex-1 text-foreground/90">{item.text}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(item.at)}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
