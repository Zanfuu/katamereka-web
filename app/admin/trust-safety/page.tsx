"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  AlertTriangleIcon,
  FileIcon,
  FileWarningIcon,
  ScaleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { RatingStars } from "@/components/rating-stars"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/format"
import { evidenceSubmissions } from "@/lib/mock/evidence"
import { fraudFlags } from "@/lib/mock/fraud"
import { reports } from "@/lib/mock/reports"
import { verificationRequests } from "@/lib/mock/verifications"
import type { Evidence, FraudFlag, Report, VerificationRequest } from "@/lib/types"

function riskIndicators(report: Report) {
  const indicators: string[] = []
  if (report.reviewRating === 1) indicators.push("Rating ekstrem (1 bintang)")
  if (report.evidence && report.evidence.length > 0) indicators.push("Evidence tersedia")
  if (report.reason.toLowerCase().includes("palsu")) indicators.push("Diduga review palsu")
  if (indicators.length === 0) indicators.push("Dilaporkan oleh pihak bisnis")
  return indicators
}

function ModerationTab() {
  const [action, setAction] = React.useState<{
    report: Report
    type: "KEEP" | "HIDE" | "REMOVE" | "INVESTIGATE"
  } | null>(null)

  const queue = reports.filter(
    (report) => report.status === "OPEN" || report.status === "UNDER_INVESTIGATION"
  )

  return (
    <div className="flex flex-col gap-4">
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

function ReportsTab() {
  const [detail, setDetail] = React.useState<Report | null>(null)
  const [action, setAction] = React.useState<"KEEP" | "HIDE" | "REMOVE" | null>(null)

  const counts = {
    open: reports.filter((r) => r.status === "OPEN").length,
    investigating: reports.filter((r) => r.status === "UNDER_INVESTIGATION").length,
    resolved: reports.filter((r) => r.status === "RESOLVED").length,
  }

  const columns: ResourceTableColumn<Report>[] = [
    {
      key: "review",
      header: "Content",
      render: (report) => (
        <div className="max-w-xs">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={report.reviewRating} size="sm" />
          </div>
          <p className="line-clamp-1 text-xs text-muted-foreground">{report.reviewExcerpt}</p>
        </div>
      ),
    },
    { key: "reporterName", header: "Reporter", render: (r) => r.reporterName },
    { key: "businessName", header: "Business", render: (r) => r.businessName },
    {
      key: "reason",
      header: "Reason",
      render: (report) => (
        <span className="line-clamp-1 max-w-xs text-muted-foreground">{report.reason}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (report) => <StatusBadge status={report.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      sortValue: (r) => r.createdAt,
      render: (report) => (
        <span className="text-muted-foreground">{formatDate(report.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (report) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetail(report)}>
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open Reports" value={counts.open} deltaTone="negative" icon={ScaleIcon} />
        <StatCard label="Under Investigation" value={counts.investigating} deltaTone="neutral" />
        <StatCard label="Resolved" value={counts.resolved} />
      </div>

      <ResourceTable
        data={reports}
        columns={columns}
        getRowId={(report) => report.id}
        emptyTitle="Tidak ada laporan review."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Laporan Review</SheetTitle>
            <SheetDescription>{detail?.businessName}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Original Review
                </h3>
                <div className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {detail.reviewerName}
                    </span>
                    <RatingStars rating={detail.reviewRating} size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{detail.reviewExcerpt}</p>
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Report Reason
                </h3>
                <p className="text-sm text-foreground/90">{detail.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Dilaporkan oleh {detail.reporterName} · {formatDate(detail.createdAt)}
                </p>
              </section>

              {detail.evidence && detail.evidence.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                    Evidence
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    {detail.evidence.map((file) => (
                      <div
                        key={file}
                        className="rounded-lg border border-border p-2 text-xs text-muted-foreground"
                      >
                        {file}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setAction("KEEP")}>
                  Keep
                </Button>
                <Button variant="outline" onClick={() => setAction("HIDE")}>
                  Hide
                </Button>
                <Button variant="destructive" onClick={() => setAction("REMOVE")}>
                  Remove
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={`${
          action === "KEEP" ? "Pertahankan" : action === "HIDE" ? "Sembunyikan" : "Hapus"
        } review ini?`}
        confirmLabel={action === "KEEP" ? "Keep" : action === "HIDE" ? "Hide" : "Remove"}
        variant={action === "KEEP" ? "default" : "destructive"}
        requireReason
        reasonLabel="Alasan moderasi"
        onConfirm={() => {
          toast.success("Keputusan moderasi berhasil disimpan.")
          setDetail(null)
        }}
      />
    </div>
  )
}

function VerificationTab() {
  const [tab, setTab] = React.useState<string>("PENDING")
  const [detail, setDetail] = React.useState<VerificationRequest | null>(null)
  const [dialog, setDialog] = React.useState<"APPROVE" | "REJECT" | null>(null)

  const statusTabs = [
    { value: "PENDING", label: "Pending" },
    { value: "VERIFIED", label: "Approved" },
    { value: "REJECTED", label: "Rejected" },
  ] as const

  const filtered = verificationRequests.filter((request) => request.status === tab)

  const columns: ResourceTableColumn<VerificationRequest>[] = [
    {
      key: "businessName",
      header: "Business",
      sortValue: (r) => r.businessName,
      render: (request) => (
        <span className="font-medium text-foreground">{request.businessName}</span>
      ),
    },
    { key: "submittedBy", header: "Submitted By", render: (r) => r.submittedBy },
    {
      key: "documents",
      header: "Documents",
      render: (request) => `${request.documents.length} dokumen`,
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      sortValue: (r) => r.submittedAt,
      render: (request) => (
        <span className="text-muted-foreground">{formatDate(request.submittedAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (request) => <StatusBadge status={request.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (request) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetail(request)}>
            Review
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(v) => typeof v === "string" && setTab(v)}>
        <TabsList>
          {statusTabs.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(request) => request.id}
        emptyTitle="Tidak ada pengajuan pada kategori ini."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{detail?.businessName}</SheetTitle>
            <SheetDescription>Diajukan oleh {detail?.submittedBy}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Submitted Documents
                </h3>
                <div className="flex flex-col gap-2">
                  {detail.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <FileIcon className="size-4 text-muted-foreground" />
                        {doc.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{doc.type}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Verification History
                </h3>
                <div className="flex flex-col gap-2">
                  {detail.history.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-foreground/90">{entry.note}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(entry.at)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {detail.status === "PENDING" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => toast.info("Permintaan dokumen tambahan telah dikirim ke admin.")}
                  >
                    Request Information
                  </Button>
                  <Button variant="destructive" onClick={() => setDialog("REJECT")}>
                    Reject
                  </Button>
                  <Button onClick={() => setDialog("APPROVE")}>
                    <ShieldCheckIcon />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          dialog === "APPROVE"
            ? `Setujui verifikasi ${detail?.businessName}?`
            : `Tolak verifikasi ${detail?.businessName}?`
        }
        confirmLabel={dialog === "APPROVE" ? "Approve" : "Reject"}
        variant={dialog === "APPROVE" ? "default" : "destructive"}
        requireReason={dialog === "REJECT"}
        reasonLabel="Alasan penolakan"
        onConfirm={() => {
          toast.success(
            dialog === "APPROVE"
              ? `${detail?.businessName} berhasil diverifikasi.`
              : `Verifikasi ${detail?.businessName} ditolak.`
          )
          setDetail(null)
        }}
      />
    </div>
  )
}

function FraudTab() {
  const [action, setAction] = React.useState<{
    flag: FraudFlag
    type: "INVESTIGATE" | "DISMISS"
  } | null>(null)

  const columns: ResourceTableColumn<FraudFlag>[] = [
    {
      key: "entityLabel",
      header: "Entity",
      render: (flag) => (
        <div>
          <p className="font-medium text-foreground">{flag.entityLabel}</p>
          <p className="text-xs text-muted-foreground">{flag.entityType}</p>
        </div>
      ),
    },
    {
      key: "riskLevel",
      header: "Risk",
      render: (flag) => <StatusBadge status={flag.riskLevel} />,
    },
    {
      key: "indicators",
      header: "Indicators",
      render: (flag) => (
        <div className="flex flex-wrap gap-1">
          {flag.indicators.map((indicator) => (
            <StatusBadge key={indicator} status="gray" label={indicator} />
          ))}
        </div>
      ),
    },
    {
      key: "detectedAt",
      header: "Detected At",
      sortValue: (f) => f.detectedAt,
      render: (flag) => <span className="text-muted-foreground">{formatDate(flag.detectedAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (flag) => <StatusBadge status={flag.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (flag) => (
        <div className="flex justify-end gap-2">
          {flag.status === "OPEN" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAction({ flag, type: "INVESTIGATE" })}
            >
              Investigate
            </Button>
          )}
          {flag.status !== "DISMISSED" && (
            <Button variant="outline" size="sm" onClick={() => setAction({ flag, type: "DISMISS" })}>
              Dismiss
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Risk score hanya indikator awal — tidak ada ban atau penghapusan otomatis. Setiap flag
        wajib diinvestigasi manual sebelum tindakan diambil.
      </p>

      <ResourceTable
        data={fraudFlags}
        columns={columns}
        getRowId={(flag) => flag.id}
        emptyTitle="Tidak ada aktivitas mencurigakan terdeteksi."
      />

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={
          action?.type === "INVESTIGATE"
            ? `Tandai ${action?.flag.entityLabel} untuk investigasi?`
            : `Abaikan flag pada ${action?.flag.entityLabel}?`
        }
        confirmLabel={action?.type === "INVESTIGATE" ? "Investigate" : "Dismiss"}
        requireReason={action?.type === "DISMISS"}
        reasonLabel="Alasan"
        onConfirm={() => toast.success("Status fraud flag berhasil diperbarui.")}
      />
    </div>
  )
}

function EvidenceTab() {
  const [detail, setDetail] = React.useState<Evidence | null>(null)
  const [action, setAction] = React.useState<"VERIFIED" | "REJECTED" | null>(null)

  const columns: ResourceTableColumn<Evidence>[] = [
    {
      key: "review",
      header: "Review",
      render: (item) => (
        <p className="line-clamp-1 max-w-xs text-muted-foreground">{item.reviewExcerpt}</p>
      ),
    },
    { key: "userName", header: "User", render: (item) => item.userName },
    { key: "businessName", header: "Business", render: (item) => item.businessName },
    {
      key: "type",
      header: "Evidence Type",
      render: (item) => <StatusBadge status="gray" label={item.type.replace("_", " ")} />,
    },
    {
      key: "submittedAt",
      header: "Submitted At",
      sortValue: (item) => item.submittedAt,
      render: (item) => <span className="text-muted-foreground">{formatDate(item.submittedAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (item) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setDetail(item)}>
            View
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Evidence bersifat privat — hanya dapat dilihat oleh Super Admin untuk keperluan investigasi
        sengketa review.
      </p>

      <ResourceTable
        data={evidenceSubmissions}
        columns={columns}
        getRowId={(item) => item.id}
        emptyTitle="Belum ada evidence yang diajukan."
      />

      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Evidence — {detail?.userName}</SheetTitle>
            <SheetDescription>{detail?.businessName}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Related Review
                </h3>
                <p className="rounded-lg border border-border p-3 text-sm text-foreground/90">
                  {detail.reviewExcerpt}
                </p>
              </section>
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Evidence File
                </h3>
                <div className="flex items-center gap-2 rounded-lg border border-border p-2.5 text-sm">
                  <FileWarningIcon className="size-4 text-muted-foreground" />
                  {detail.type.replace("_", " ")}.file
                </div>
              </section>
              {detail.status === "PENDING" && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => toast.info("Permintaan evidence tambahan dikirim.")}>
                    Request More Evidence
                  </Button>
                  <Button variant="destructive" onClick={() => setAction("REJECTED")}>
                    Reject
                  </Button>
                  <Button onClick={() => setAction("VERIFIED")}>Verify</Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={action === "VERIFIED" ? "Verifikasi evidence ini?" : "Tolak evidence ini?"}
        confirmLabel={action === "VERIFIED" ? "Verify" : "Reject"}
        variant={action === "VERIFIED" ? "default" : "destructive"}
        requireReason={action === "REJECTED"}
        reasonLabel="Alasan penolakan"
        onConfirm={() => {
          toast.success("Status evidence berhasil diperbarui.")
          setDetail(null)
        }}
      />
    </div>
  )
}

export default function TrustSafetyPage() {
  const openModeration = reports.filter(
    (r) => r.status === "OPEN" || r.status === "UNDER_INVESTIGATION"
  ).length
  const pendingVerification = verificationRequests.filter((v) => v.status === "PENDING").length
  const openFraud = fraudFlags.filter((f) => f.status === "OPEN").length
  const pendingEvidence = evidenceSubmissions.filter((e) => e.status === "PENDING").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trust & Safety"
        description="Pusat moderasi, laporan, verifikasi, deteksi fraud, dan evidence platform KataMereka."
      />

      <Tabs defaultValue="moderation">
        <TabsList>
          <TabsTrigger value="moderation">
            Moderation{openModeration > 0 && ` (${openModeration})`}
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="verification">
            Verification{pendingVerification > 0 && ` (${pendingVerification})`}
          </TabsTrigger>
          <TabsTrigger value="fraud">Fraud{openFraud > 0 && ` (${openFraud})`}</TabsTrigger>
          <TabsTrigger value="evidence">
            Evidence{pendingEvidence > 0 && ` (${pendingEvidence})`}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="moderation" className="mt-4">
          <ModerationTab />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="verification" className="mt-4">
          <VerificationTab />
        </TabsContent>
        <TabsContent value="fraud" className="mt-4">
          <FraudTab />
        </TabsContent>
        <TabsContent value="evidence" className="mt-4">
          <EvidenceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
