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
  ChevronDownIcon,
  ClipboardListIcon,
  FlagIcon,
  MapPinIcon,
  RefreshCwIcon,
  ScrollTextIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { DateRangeSelector, type DateRangeValue } from "@/components/date-range-selector"
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
import {
  fetchAdminOverviewAnalytics,
  fetchAdminReviewReports,
  type AdminOverviewAnalytics,
} from "@/lib/admin-api"
import { fetchAdminBusinessClaims } from "@/lib/api-client"
import { formatDate, timeAgo } from "@/lib/format"

const growthConfig: ChartConfig = {
  users: { label: "Users", color: "var(--color-chart-1)" },
  businesses: { label: "Businesses", color: "var(--color-chart-2)" },
  reviews: { label: "Reviews", color: "var(--color-chart-3)" },
}

const activityConfig: ChartConfig = {
  newReviews: { label: "Review Baru", color: "var(--color-primary)" },
  reportedReviews: { label: "Review Dilaporkan", color: "var(--color-destructive)" },
}

const STAR_COLORS: Record<number, string> = {
  5: "#16A34A",
  4: "#4ADE80",
  3: "#FACC15",
  2: "#FB923C",
  1: "#EF4444",
}

interface NeedsAttentionItem {
  id: string
  item: string
  type: "Verification" | "Report" | "Moderation"
  priority: "High" | "Medium" | "Low"
  status: string
  createdAt: string
  href: string
}

function formatMonthLabel(monthStr?: string) {
  if (!monthStr) return ""
  const parts = monthStr.split("-")
  if (parts.length === 2) {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ]
    const m = parseInt(parts[1], 10) - 1
    return `${monthNames[m] || parts[1]} '${parts[0].slice(2)}`
  }
  return monthStr
}

function formatDateLabel(dateStr?: string) {
  if (!dateStr) return ""
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}`
  }
  return dateStr
}

export default function AdminOverviewPage() {
  const [range, setRange] = React.useState("30d")
  const [analytics, setAnalytics] = React.useState<AdminOverviewAnalytics | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Needs Attention items from reports & claims
  const [needsAttention, setNeedsAttention] = React.useState<NeedsAttentionItem[]>([])

  const loadData = React.useCallback(async (selectedRange: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetchAdminOverviewAnalytics(selectedRange)
      if (res && res.data) {
        setAnalytics(res.data)
      }
    } catch (err: any) {
      console.error("Gagal memuat analitik overview super admin:", err)
      setError(err?.message || "Gagal memuat data analitik")
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load overview analytics on range change
  React.useEffect(() => {
    loadData(range)
  }, [range, loadData])

  // Load secondary attention items (claims & review reports)
  React.useEffect(() => {
    let active = true
    async function loadAttention() {
      try {
        const [reportsRes, claimsRes] = await Promise.allSettled([
          fetchAdminReviewReports({ limit: 10, status: "PENDING" }),
          fetchAdminBusinessClaims({ limit: 10 }),
        ])
        if (!active) return

        const items: NeedsAttentionItem[] = []

        if (claimsRes.status === "fulfilled" && claimsRes.value?.data) {
          const pending = (claimsRes.value.data as any[]).filter((c) => c.status === "PENDING")
          pending.forEach((c) => {
            items.push({
              id: c.id,
              item: c.business?.name || "Pengajuan Klaim Bisnis",
              type: "Verification",
              priority: "High",
              status: c.status,
              createdAt: c.created_at || new Date().toISOString(),
              href: "/admin/trust-safety",
            })
          })
        }

        if (reportsRes.status === "fulfilled" && reportsRes.value?.data) {
          const pendingRep = reportsRes.value.data.filter((r) => r.status === "PENDING")
          pendingRep.forEach((r) => {
            items.push({
              id: r.id,
              item: `${r.business?.name || "Review"} — ${r.reason}`,
              type: "Report",
              priority: "High",
              status: r.status,
              createdAt: r.created_at,
              href: "/admin/trust-safety",
            })
          })
        }

        setNeedsAttention(items)
      } catch {
        // Silently ignore secondary attention errors
      }
    }
    loadAttention()
    return () => {
      active = false
    }
  }, [])

  const cards = analytics?.overviewCards || {
    totalCustomers: { value: 0, label: "Business Admin", growth: "+0%" },
    totalBusinesses: { value: 0, label: "Total Businesses", growth: "+0%" },
    verifiedBusinesses: { value: 0, label: "Verified Businesses", growth: "+0%" },
    totalUsers: { value: 0, label: "Total Users", growth: "+0%" },
    totalReviews: { value: 0, label: "Total Reviews", growth: "+0%" },
    pendingVerification: { value: 0, label: "Pending Verification", growth: "0%" },
    reportedReviews: { value: 0, label: "Reported Reviews", growth: "+0%" },
    pendingModeration: { value: 0, label: "Pending Moderation", growth: "0%" },
  }

  const platformGrowth = analytics?.platformGrowth || []
  const reviewActivity = analytics?.reviewActivity || []
  const ratingDist = analytics?.ratingDistribution
  const topActiveCities = analytics?.topActiveCities || []
  const recentBusinesses = analytics?.recentBusinesses || []
  const recentActivities = analytics?.recentActivities || []

  // Rating donut segments
  const ratingSegments = (ratingDist?.breakdown || []).map((b) => ({
    label: `${b.star} Bintang (${b.percentage}%)`,
    value: b.count,
    color: STAR_COLORS[b.star] || "#94A3B8",
  }))

  const needsAttentionColumns: ResourceTableColumn<NeedsAttentionItem>[] = [
    {
      key: "item",
      header: "Item",
      render: (row) => <span className="font-medium text-foreground">{row.item}</span>,
    },
    {
      key: "type",
      header: "Tipe",
      render: (row) => <StatusBadge status="gray" label={row.type} />,
    },
    {
      key: "priority",
      header: "Prioritas",
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
      header: "Waktu Pengajuan",
      render: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" render={<Link href={row.href} />}>
            Tinjau
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Filter Range */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Selamat datang, Super Admin!
            </h1>
            {isLoading && <RefreshCwIcon className="size-4 animate-spin text-muted-foreground" />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Berikut adalah ringkasan analitik dan performa platform KataMereka secara realtime.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelector
            defaultValue={range}
            onChange={(val: DateRangeValue) => {
              if (val.preset) setRange(val.preset)
            }}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => loadData(range)}
            disabled={isLoading}
            title="Muat ulang analitik"
          >
            <RefreshCwIcon className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => loadData(range)}>
            Coba Lagi
          </Button>
        </div>
      )}

      {/* 8 Kotak Kartu Statistik di Atas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Customers"
          sublabel={cards.totalCustomers?.label || "Business Admin"}
          value={cards.totalCustomers?.value?.toLocaleString("id-ID") ?? "0"}
          delta={cards.totalCustomers?.growth}
          hint="dari periode lalu"
          icon={UserCogIcon}
          href="/admin/customers"
        />
        <StatCard
          label="Total Businesses"
          value={cards.totalBusinesses?.value?.toLocaleString("id-ID") ?? "0"}
          delta={cards.totalBusinesses?.growth}
          hint="dari periode lalu"
          icon={BuildingIcon}
          href="/admin/businesses"
        />
        <StatCard
          label="Verified Businesses"
          value={cards.verifiedBusinesses?.value?.toLocaleString("id-ID") ?? "0"}
          delta={cards.verifiedBusinesses?.growth}
          hint="dari periode lalu"
          icon={ShieldCheckIcon}
          href="/admin/businesses"
        />
        <StatCard
          label="Total Users"
          value={cards.totalUsers?.value?.toLocaleString("id-ID") ?? "0"}
          delta={cards.totalUsers?.growth}
          hint="dari periode lalu"
          icon={UsersIcon}
          href="/admin/users"
        />
        <StatCard
          label="Total Reviews"
          value={cards.totalReviews?.value?.toLocaleString("id-ID") ?? "0"}
          delta={cards.totalReviews?.growth}
          hint="dari periode lalu"
          icon={StarIcon}
          href="/admin/reviews"
        />
        <StatCard
          label="Pending Verification"
          value={cards.pendingVerification?.value ?? 0}
          delta={cards.pendingVerification?.growth}
          deltaTone={cards.pendingVerification?.growth?.startsWith("-") ? "negative" : "positive"}
          hint="klaim menunggu"
          icon={ClipboardListIcon}
          href="/admin/trust-safety"
        />
        <StatCard
          label="Reported Reviews"
          value={cards.reportedReviews?.value ?? 0}
          delta={cards.reportedReviews?.growth}
          deltaTone={cards.reportedReviews?.growth?.startsWith("-") ? "positive" : "negative"}
          hint="ulasan dilaporkan"
          icon={FlagIcon}
          iconTone="destructive"
          href="/admin/trust-safety"
        />
        <StatCard
          label="Pending Moderation"
          value={cards.pendingModeration?.value ?? 0}
          delta={cards.pendingModeration?.growth}
          deltaTone={cards.pendingModeration?.growth?.startsWith("-") ? "positive" : "negative"}
          hint="antrean moderasi"
          icon={ShieldAlertIcon}
          iconTone="warning"
          href="/admin/trust-safety"
        />
      </div>

      {/* Baris Grafik & Diagram */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Grafik Garis "Pertumbuhan Platform" */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Pertumbuhan Platform</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Tren pengguna, bisnis, dan review</p>
            </div>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md">
              Bulanan
            </span>
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
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatMonthLabel}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line
                  dataKey="users"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  dataKey="businesses"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  dataKey="reviews"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Grafik Batang "Aktivitas Review" */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Aktivitas Review</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Ulasan masuk & laporan harian</p>
            </div>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md">
              Harian
            </span>
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
              <BarChart data={reviewActivity} margin={{ left: -20, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDateLabel}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Bar dataKey="newReviews" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reportedReviews" fill="var(--color-destructive)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Diagram Donat "Distribusi Rating" */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Distribusi Rating (Semua Bisnis)</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rata-rata rating platform:{" "}
              <span className="font-bold text-amber-500">
                ★ {ratingDist?.averageRating ? ratingDist.averageRating.toFixed(2) : "0.00"}
              </span>{" "}
              dari {ratingDist?.total?.toLocaleString("id-ID") ?? 0} ulasan
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <StatusDonutChart
              segments={ratingSegments}
              centerValue={ratingDist?.total?.toLocaleString("id-ID") ?? "0"}
              centerLabel="Total Review"
            />
            {/* Legend / Breakdown mini list */}
            <div className="mt-3 grid grid-cols-5 gap-1 w-full text-center">
              {[5, 4, 3, 2, 1].map((s) => {
                const item = (ratingDist?.breakdown || []).find((b) => b.star === s)
                return (
                  <div key={s} className="rounded-lg bg-muted/50 p-1.5 text-xs">
                    <p className="font-bold text-foreground">★ {s}</p>
                    <p className="text-[11px] text-muted-foreground">{item?.percentage ?? 0}%</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Baris Tabel Ringkasan (5 Kota Teraktif, Business Terbaru, Aktivitas Terbaru) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Tabel 5 Kota Paling Aktif */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <MapPinIcon className="size-4 text-primary" />
                <span>5 Kota Paling Aktif</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Kota dengan sebaran bisnis terbanyak</p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-3.5">
            {topActiveCities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada data kota aktif.
              </p>
            ) : (
              topActiveCities.slice(0, 5).map((c, idx) => {
                const maxCount = topActiveCities[0]?.totalBusinesses || 1
                const pct = Math.round((c.totalBusinesses / maxCount) * 100)
                return (
                  <div key={c.city} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            idx === 0
                              ? "bg-amber-100 text-amber-800"
                              : idx === 1
                                ? "bg-slate-200 text-slate-800"
                                : idx === 2
                                  ? "bg-amber-50 text-amber-900 border border-amber-200"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-medium text-foreground">{c.city}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground/80">
                        {c.totalBusinesses.toLocaleString("id-ID")}{" "}
                        <span className="font-normal text-muted-foreground">bisnis</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary/80 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Tabel Business Terbaru */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <BuildingIcon className="size-4 text-primary" />
                <span>Business Terbaru</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Bisnis yang baru terdaftar</p>
            </div>
            <Button variant="link" size="sm" render={<Link href="/admin/businesses" />}>
              Lihat Semua
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {recentBusinesses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada bisnis terbaru.
              </p>
            ) : (
              recentBusinesses.slice(0, 5).map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/businesses/${b.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl p-2.5 text-sm transition-colors hover:bg-muted/70 border border-transparent hover:border-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{b.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      /{b.slug} {b.city ? `• ${b.city}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {b.category || "Umum"}
                  </span>
                  <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                    {formatDate(b.createdAt)}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Tabel Aktivitas Terbaru */}
        <Card className="lg:col-span-1 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-1.5">
                <StarIcon className="size-4 text-amber-500 fill-amber-400" />
                <span>Aktivitas Terbaru</span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Ulasan customer yang baru masuk</p>
            </div>
            <Button variant="link" size="sm" render={<Link href="/admin/reviews" />}>
              Kelola Review
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Belum ada aktivitas review baru.
              </p>
            ) : (
              recentActivities.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-2.5 rounded-xl p-2 text-sm transition-colors hover:bg-muted/50 border border-border/50"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-200/80 mt-0.5">
                    <StarIcon className="size-3.5 fill-amber-400 text-amber-500" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium text-foreground text-xs">
                        <span className="font-bold">{a.userName}</span>
                        <span className="text-muted-foreground"> di </span>
                        <span className="text-primary font-semibold">{a.businessName}</span>
                      </p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {timeAgo(a.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground italic">
                      &ldquo;{a.content}&rdquo;
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Needs Attention Queue (jika ada klaim atau laporan masuk) */}
      {needsAttention.length > 0 && (
        <Card className="shadow-xs border-amber-200/70 bg-gradient-to-r from-amber-50/20 via-background to-background">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <span>Needs Attention</span>
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-bold text-destructive">
                  {needsAttention.length}
                </span>
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pengajuan klaim dan laporan ulasan yang butuh tindakan segera oleh Admin
              </p>
            </div>
            <Button variant="link" size="sm" render={<Link href="/admin/trust-safety" />}>
              Lihat di Trust & Safety
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
      )}
    </div>
  )
}
