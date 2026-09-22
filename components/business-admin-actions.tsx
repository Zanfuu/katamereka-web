"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  ChevronDownIcon,
  FileIcon,
  ScaleIcon,
  ShieldBanIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { RatingStars } from "@/components/rating-stars"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDate } from "@/lib/format"
import { getReportsByBusiness } from "@/lib/mock/reports"
import { getVerificationByBusiness } from "@/lib/mock/verifications"
import type { Business } from "@/lib/types"

export function BusinessAdminActions({ business }: { business: Business }) {
  const [sheet, setSheet] = React.useState<"VERIFICATION" | "REPORTS" | null>(null)
  const [dialog, setDialog] = React.useState<"APPROVE" | "REJECT" | "SUSPEND" | "ACTIVATE" | null>(
    null
  )

  const verification = getVerificationByBusiness(business.id)
  const reports = getReportsByBusiness(business.id)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          Admin Actions
          <ChevronDownIcon className="size-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Trust & Safety</DropdownMenuLabel>
          <DropdownMenuItem
            disabled={business.verificationStatus !== "PENDING"}
            onClick={() => setSheet("VERIFICATION")}
          >
            <ShieldCheckIcon />
            Approve Verification
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/admin/businesses/${business.id}/reviews`} />}>
            <StarIcon />
            Moderate Review
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={reports.length === 0}
            onClick={() => setSheet("REPORTS")}
          >
            <ScaleIcon />
            View Reports{reports.length > 0 && ` (${reports.length})`}
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href={`/admin/businesses/${business.id}/activity`} />}>
            <FileIcon />
            View Audit Activity
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Administrative Actions</DropdownMenuLabel>
          {business.status === "SUSPENDED" ? (
            <DropdownMenuItem onClick={() => setDialog("ACTIVATE")}>
              <ShieldCheckIcon />
              Activate Business
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem variant="destructive" onClick={() => setDialog("SUSPEND")}>
              <ShieldBanIcon />
              Suspend Business
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Sheet open={sheet === "VERIFICATION"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Verification Request</SheetTitle>
            <SheetDescription>{business.name}</SheetDescription>
          </SheetHeader>
          {verification ? (
            <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-4">
              <section>
                <h3 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
                  Submitted Documents
                </h3>
                <div className="flex flex-col gap-2">
                  {verification.documents.map((doc) => (
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
                <Button onClick={() => setDialog("APPROVE")}>Approve</Button>
              </div>
            </div>
          ) : (
            <p className="px-4 text-sm text-muted-foreground">Belum ada pengajuan verifikasi.</p>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={sheet === "REPORTS"} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Reports</SheetTitle>
            <SheetDescription>{business.name}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 overflow-y-auto px-4 pb-4">
            {reports.map((report) => (
              <div key={report.id} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <RatingStars rating={report.reviewRating} size="sm" />
                  <StatusBadge status={report.status} />
                </div>
                <p className="line-clamp-2 text-sm text-foreground/90">{report.reviewExcerpt}</p>
                <p className="text-xs text-muted-foreground">
                  Dilaporkan {formatDate(report.createdAt)} oleh {report.reporterName}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={dialog === "APPROVE" || dialog === "REJECT"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog === "APPROVE" ? `Setujui verifikasi ${business.name}?` : `Tolak verifikasi ${business.name}?`}
        confirmLabel={dialog === "APPROVE" ? "Approve" : "Reject"}
        variant={dialog === "APPROVE" ? "default" : "destructive"}
        requireReason={dialog === "REJECT"}
        reasonLabel="Alasan penolakan"
        onConfirm={() => {
          toast.success(
            dialog === "APPROVE"
              ? `${business.name} berhasil diverifikasi.`
              : `Verifikasi ${business.name} ditolak.`
          )
          setSheet(null)
        }}
      />

      <ConfirmDialog
        open={dialog === "SUSPEND" || dialog === "ACTIVATE"}
        onOpenChange={(open) => !open && setDialog(null)}
        title={
          dialog === "SUSPEND"
            ? `Suspend ${business.name}?`
            : `Aktifkan kembali ${business.name}?`
        }
        description={
          dialog === "SUSPEND"
            ? "Business tidak akan tampil di pencarian publik selama status suspended."
            : undefined
        }
        confirmLabel={dialog === "SUSPEND" ? "Suspend" : "Activate"}
        variant={dialog === "SUSPEND" ? "destructive" : "default"}
        requireReason={dialog === "SUSPEND"}
        reasonLabel="Alasan suspend"
        onConfirm={() =>
          toast.success(
            dialog === "SUSPEND"
              ? `${business.name} berhasil di-suspend.`
              : `${business.name} berhasil diaktifkan kembali.`
          )
        }
      />
    </>
  )
}
