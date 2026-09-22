"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  CheckIcon,
  ExternalLinkIcon,
  FlagIcon,
  HomeIcon,
  ImageIcon,
  MessageSquareIcon,
  XIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { DateRangeSelector } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { formatDateTime } from "@/lib/format"
import { getBusinessById } from "@/lib/mock/businesses"
import { reports as initialReports } from "@/lib/mock/reports"
import type { Report, ReportTargetType } from "@/lib/types"

const REPORT_STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "OPEN", label: "Menunggu" },
  { value: "UNDER_INVESTIGATION", label: "Dalam Proses" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
]

const REPORT_TARGET_OPTIONS = [
  { value: "all", label: "Semua Target" },
  { value: "REVIEW", label: "Review" },
  { value: "PHOTO", label: "Foto" },
  { value: "BUSINESS_PROFILE", label: "Profil Bisnis" },
]

const REPORT_STATUS_DISPLAY: Record<Report["status"], string> = {
  OPEN: "MENUNGGU",
  UNDER_INVESTIGATION: "DALAM_PROSES",
  RESOLVED: "SELESAI",
  REJECTED: "DITOLAK",
}

const TARGET_META: Record<ReportTargetType, { label: string; icon: typeof FlagIcon; summary: string }> = {
  REVIEW: { label: "Review", icon: MessageSquareIcon, summary: "Ulasan tidak pantas" },
  PHOTO: { label: "Foto", icon: ImageIcon, summary: "Foto tidak sesuai" },
  BUSINESS_PROFILE: { label: "Profil Bisnis", icon: FlagIcon, summary: "Informasi tidak akurat" },
}

function reportDisplayId(id: string) {
  return `#R-${id.replace(/\D/g, "").padStart(6, "0")}`
}

const AVATAR_TONES = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
  "bg-pink-100 text-pink-700",
  "bg-purple-100 text-purple-700",
  "bg-cyan-100 text-cyan-700",
]

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

function avatarTone(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % AVATAR_TONES.length
  return AVATAR_TONES[hash]
}

export default function TrustSafetyPage() {
  const [reportList, setReportList] = React.useState<Report[]>(initialReports)
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [targetFilter, setTargetFilter] = React.useState("all")
  const [detail, setDetail] = React.useState<Report | null>(null)
  const [noteDraft, setNoteDraft] = React.useState("")
  const [confirmAction, setConfirmAction] = React.useState<"RESOLVE" | "REJECT" | null>(null)

  const counts = {
    total: reportList.length,
    resolved: reportList.filter((r) => r.status === "RESOLVED").length,
  }

  const filtered = reportList.filter((report) => {
    if (statusFilter !== "all" && report.status !== statusFilter) return false
    if (targetFilter !== "all" && report.targetType !== targetFilter) return false
    if (
      search &&
      !reportDisplayId(report.id).toLowerCase().includes(search.toLowerCase()) &&
      !report.businessName.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  function openDetail(report: Report) {
    setDetail(report)
    setNoteDraft(report.internalNote ?? "")
  }

  function applyDecision(status: "RESOLVED" | "REJECTED") {
    if (!detail) return
    setReportList((prev) =>
      prev.map((r) => (r.id === detail.id ? { ...r, status, internalNote: noteDraft } : r))
    )
    toast.success(
      status === "RESOLVED"
        ? `Laporan ${reportDisplayId(detail.id)} ditandai selesai.`
        : `Laporan ${reportDisplayId(detail.id)} ditolak.`
    )
    setDetail(null)
  }

  const columns: ResourceTableColumn<Report>[] = [
    {
      key: "id",
      header: "ID Laporan",
      render: (report) => (
        <span className="font-medium text-foreground">{reportDisplayId(report.id)}</span>
      ),
    },
    {
      key: "reporterName",
      header: "Dilaporkan oleh (Business Admin)",
      render: (report) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback className={avatarTone(report.businessId)}>
              {initials(report.businessName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-foreground">{report.businessName}</span>
        </div>
      ),
    },
    {
      key: "targetType",
      header: "Target",
      render: (report) => {
        const meta = TARGET_META[report.targetType]
        const Icon = meta.icon
        return (
          <span className="flex items-center gap-1.5 text-foreground">
            <Icon className="size-3.5 text-muted-foreground" />
            {meta.label}
          </span>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (report) => (
        <StatusBadge status={REPORT_STATUS_DISPLAY[report.status]} />
      ),
    },
    {
      key: "createdAt",
      header: "Tanggal",
      sortValue: (r) => r.createdAt,
      render: (report) => (
        <span className="text-muted-foreground">{formatDateTime(report.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (report) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <FlagIcon className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetail(report)}>Lihat</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  const detailBusiness = detail ? getBusinessById(detail.businessId) : undefined
  const detailMeta = detail ? TARGET_META[detail.targetType] : undefined

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin" />}>
              <HomeIcon className="size-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Trust & Safety</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Trust & Safety"
        description="Pantau dan kelola laporan yang masuk untuk menjaga keamanan, kenyamanan, dan kepercayaan di platform KataMereka."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Total Laporan"
          value={counts.total}
          delta="-12%"
          hint="dari bulan lalu"
          icon={FlagIcon}
          iconTone="destructive"
          onClick={() => setStatusFilter("all")}
        />
        <StatCard
          label="Selesai Ditindaklanjuti"
          value={counts.resolved}
          delta="+20%"
          hint="dari bulan lalu"
          icon={CheckIcon}
          onClick={() => setStatusFilter("RESOLVED")}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Cari ID laporan atau nama bisnis..." />
            <div className="flex flex-wrap items-center gap-2">
              <FilterDropdown label="Status" options={REPORT_STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
              <FilterDropdown label="Target" options={REPORT_TARGET_OPTIONS} value={targetFilter} onChange={setTargetFilter} />
              <DateRangeSelector />
            </div>
          </div>

          <ResourceTable
            data={filtered}
            columns={columns}
            getRowId={(report) => report.id}
            itemLabel="laporan"
            pageSize={10}
            emptyTitle="Tidak ada laporan ditemukan."
          />
        </div>

        {detail && detailMeta && (
          <div className="w-full shrink-0 rounded-xl border border-border bg-card lg:sticky lg:top-4 lg:w-[380px]">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="font-semibold text-foreground">Detail Laporan</p>
              <Button variant="ghost" size="icon-sm" onClick={() => setDetail(null)}>
                <XIcon className="size-4" />
              </Button>
            </div>

            <div className="flex flex-col gap-5 overflow-y-auto p-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={REPORT_STATUS_DISPLAY[detail.status]} />
                <span className="text-sm text-muted-foreground">{reportDisplayId(detail.id)}</span>
              </div>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Informasi Pelapor
                </h3>
                <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarFallback className={avatarTone(detail.businessId)}>
                        {initials(detail.businessName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground">{detail.businessName}</p>
                      <p className="text-xs text-muted-foreground">{detail.reporterEmail ?? "-"}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    render={<Link href={`/admin/businesses/${detail.businessId}`} />}
                  >
                    Lihat Bisnis
                    <ExternalLinkIcon className="size-3.5" />
                  </Button>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Target Laporan
                </h3>
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <detailMeta.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{detailMeta.label}</p>
                    <p className="text-xs text-muted-foreground">{detailMeta.summary}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Konten Dilaporkan
                </h3>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{detail.reviewerName}</span>
                    {detail.targetType === "REVIEW" && (
                      <RatingStars rating={detail.reviewRating} size="sm" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(detail.createdAt)}</p>
                  <p className="mt-2 text-sm text-foreground/90">{detail.reviewExcerpt}</p>
                  {detailBusiness && (
                    <Link
                      href={`/business/${detailBusiness.slug}`}
                      target="_blank"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Lihat di Platform
                      <ExternalLinkIcon className="size-3" />
                    </Link>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Alasan Laporan
                </h3>
                <p className="rounded-lg bg-secondary p-3 text-sm text-foreground/90 italic">
                  &ldquo;{detail.reason}&rdquo;
                </p>
              </section>

              {detail.evidence && detail.evidence.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                    Lampiran (jika ada)
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {detail.evidence.slice(0, 4).map((file, index) => {
                      const isLast = index === 3 && detail.evidence!.length > 4
                      return (
                        <div
                          key={file}
                          className="relative flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground"
                        >
                          <ImageIcon className="size-5" />
                          {isLast && (
                            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/60 text-sm font-semibold text-background">
                              +{detail.evidence!.length - 4}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )}

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Catatan Internal
                </h3>
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  placeholder="Tulis catatan internal..."
                />
              </section>

              <div className="flex items-center gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setDetail(null)}>
                  Tutup
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmAction("REJECT")}
                >
                  <XIcon />
                  Tolak
                </Button>
                <Button className="flex-1" onClick={() => setConfirmAction("RESOLVE")}>
                  <CheckIcon />
                  Tandai Selesai
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={
          confirmAction === "RESOLVE"
            ? `Tandai laporan ${detail ? reportDisplayId(detail.id) : ""} selesai?`
            : `Tolak laporan ${detail ? reportDisplayId(detail.id) : ""}?`
        }
        confirmLabel={confirmAction === "RESOLVE" ? "Tandai Selesai" : "Tolak"}
        variant={confirmAction === "RESOLVE" ? "default" : "destructive"}
        requireReason={confirmAction === "REJECT"}
        reasonLabel="Alasan penolakan"
        onConfirm={() => applyDecision(confirmAction === "RESOLVE" ? "RESOLVED" : "REJECTED")}
      />
    </div>
  )
}
