"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { AlertTriangleIcon, HomeIcon, ShieldAlertIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { StatusBadge } from "@/components/status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { reports } from "@/lib/mock/reports"
import type { Report } from "@/lib/types"

function riskIndicators(report: Report) {
  const indicators: string[] = []
  if (report.reviewRating === 1) indicators.push("Rating ekstrem (1 bintang)")
  if (report.evidence && report.evidence.length > 0) indicators.push("Evidence tersedia")
  if (report.reason.toLowerCase().includes("palsu")) indicators.push("Diduga review palsu")
  if (indicators.length === 0) indicators.push("Dilaporkan oleh pihak bisnis")
  return indicators
}

export default function AdminModerationPage() {
  const [action, setAction] = React.useState<{
    report: Report
    type: "KEEP" | "HIDE" | "REMOVE" | "INVESTIGATE"
  } | null>(null)

  const queue = reports.filter(
    (report) => report.status === "OPEN" || report.status === "UNDER_INVESTIGATION"
  )

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
            <BreadcrumbPage>Moderation</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Moderation Center"
        description="Antrean terpusat untuk item yang membutuhkan tindakan moderasi."
      />

      {queue.length === 0 && (
        <EmptyState
          icon={ShieldAlertIcon}
          title="Tidak ada item yang membutuhkan moderasi."
          description="Semua laporan sudah ditindaklanjuti."
        />
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {queue.map((report) => (
          <Card key={report.id}>
            <CardContent className="flex flex-col gap-3 pt-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{report.reviewerName}</p>
                  <p className="text-xs text-muted-foreground">{report.businessName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <RatingStars rating={report.reviewRating} size="sm" />
                  <StatusBadge status={report.status} />
                </div>
              </div>

              <p className="rounded-lg bg-secondary p-3 text-sm text-foreground/90">
                {report.reviewExcerpt}
              </p>

              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">Reason</p>
                <p className="text-sm text-foreground/90">{report.reason}</p>
              </div>

              <div>
                <p className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <AlertTriangleIcon className="size-3.5" />
                  Risk Indicators
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {riskIndicators(report).map((indicator) => (
                    <StatusBadge key={indicator} status="MEDIUM" label={indicator} />
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Dilaporkan {formatDate(report.createdAt)} oleh {report.reporterName}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAction({ report, type: "INVESTIGATE" })}
                >
                  Investigate
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAction({ report, type: "KEEP" })}>
                  Keep
                </Button>
                <Button variant="outline" size="sm" onClick={() => setAction({ report, type: "HIDE" })}>
                  Hide
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setAction({ report, type: "REMOVE" })}
                >
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={`${
          action?.type === "KEEP"
            ? "Pertahankan"
            : action?.type === "HIDE"
              ? "Sembunyikan"
              : action?.type === "REMOVE"
                ? "Hapus"
                : "Investigasi"
        } review dari ${action?.report.reviewerName}?`}
        description={
          action?.type === "INVESTIGATE"
            ? "Review akan ditandai untuk investigasi lebih lanjut, tidak dihapus otomatis."
            : undefined
        }
        confirmLabel={
          action?.type === "KEEP"
            ? "Keep"
            : action?.type === "HIDE"
              ? "Hide"
              : action?.type === "REMOVE"
                ? "Remove"
                : "Investigate"
        }
        variant={action?.type === "KEEP" || action?.type === "INVESTIGATE" ? "default" : "destructive"}
        requireReason={action?.type === "HIDE" || action?.type === "REMOVE"}
        reasonLabel="Alasan moderasi"
        onConfirm={() => toast.success("Tindakan moderasi berhasil dicatat di audit log.")}
      />
    </div>
  )
}
