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
  UserCogIcon,
} from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { RatingStars } from "@/components/rating-stars"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { fetchBusinessOwner, changeBusinessOwner } from "@/lib/admin-api"
import { formatDate } from "@/lib/format"
import { getReportsByBusiness } from "@/lib/mock/reports"
import { getVerificationByBusiness } from "@/lib/mock/verifications"
import type { Business } from "@/lib/types"

export function BusinessAdminActions({ business }: { business: Business }) {
  const [sheet, setSheet] = React.useState<"VERIFICATION" | "REPORTS" | null>(null)
  const [dialog, setDialog] = React.useState<"APPROVE" | "REJECT" | "SUSPEND" | "ACTIVATE" | null>(
    null
  )

  // Owner management
  const [ownerModalOpen, setOwnerModalOpen] = React.useState(false)
  const [ownerEmailInput, setOwnerEmailInput] = React.useState(business.ownerEmail || "")
  const [ownerReasonInput, setOwnerReasonInput] = React.useState("")
  const [ownerLoading, setOwnerLoading] = React.useState(false)
  const [ownerSubmitting, setOwnerSubmitting] = React.useState(false)
  const [currentOwner, setCurrentOwner] = React.useState<{
    ownerId: string | null
    ownerName: string | null
    ownerEmail: string | null
    isClaimed: boolean
  }>({
    ownerId: business.ownerId || null,
    ownerName: business.ownerName !== "-" ? business.ownerName : null,
    ownerEmail: business.ownerEmail || null,
    isClaimed: !!business.isClaimed,
  })

  const openOwnerModal = async () => {
    setOwnerModalOpen(true)
    setOwnerLoading(true)
    try {
      const res = await fetchBusinessOwner(business.id)
      if (res && res.data) {
        setCurrentOwner({
          ownerId: res.data.owner?.user_id || null,
          ownerName: res.data.owner?.name || null,
          ownerEmail: res.data.owner?.email || null,
          isClaimed: res.data.is_claimed,
        })
        if (res.data.owner?.email) {
          setOwnerEmailInput(res.data.owner.email)
        }
      }
    } catch (err: any) {
      console.warn("Gagal memuat data owner via API:", err)
    } finally {
      setOwnerLoading(false)
    }
  }

  const handleSaveOwner = async () => {
    const email = ownerEmailInput.trim()
    if (!email) {
      toast.error("Silakan masukkan email user yang akan dijadikan owner.")
      return
    }

    setOwnerSubmitting(true)
    try {
      const res = await changeBusinessOwner(business.id, {
        email,
        reason: ownerReasonInput.trim() || undefined,
      })
      const newOwner = res.data?.owner
      setCurrentOwner({
        ownerId: newOwner?.user_id || null,
        ownerName: newOwner?.name || email,
        ownerEmail: newOwner?.email || email,
        isClaimed: true,
      })
      toast.success(res.message || `Owner berhasil diubah ke ${newOwner?.email || email}`)
      setOwnerModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah owner bisnis.")
    } finally {
      setOwnerSubmitting(false)
    }
  }

  const handleUnclaimOwner = async () => {
    setOwnerSubmitting(true)
    try {
      const res = await changeBusinessOwner(business.id, {
        unclaim: true,
        reason: ownerReasonInput.trim() || undefined,
      })
      setCurrentOwner({
        ownerId: null,
        ownerName: null,
        ownerEmail: null,
        isClaimed: false,
      })
      setOwnerEmailInput("")
      toast.success(res.message || "Kepemilikan bisnis berhasil dilepas (Unclaim).")
      setOwnerModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || "Gagal melepas kepemilikan bisnis.")
    } finally {
      setOwnerSubmitting(false)
    }
  }

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
          <DropdownMenuItem onClick={openOwnerModal}>
            <UserCogIcon className="size-4" />
            Kelola Owner
          </DropdownMenuItem>
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
                  onClick={() => toast.success("Permintaan dokumen tambahan telah dikirim ke admin.")}
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

      <Dialog open={ownerModalOpen} onOpenChange={setOwnerModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCogIcon className="size-5 text-primary" />
              Kelola Owner Bisnis
            </DialogTitle>
            <DialogDescription>
              Ubah atau tetapkan pengguna yang menjadi owner resmi dari bisnis{" "}
              <strong className="text-foreground">{business.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Current Owner Box */}
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Owner Saat Ini
              </p>
              {ownerLoading ? (
                <p className="text-sm text-muted-foreground animate-pulse">Memuat data owner...</p>
              ) : currentOwner.isClaimed && currentOwner.ownerEmail ? (
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-foreground">
                    {currentOwner.ownerName || "Tanpa Nama"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {currentOwner.ownerEmail}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      Claimed / Verified
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                      Belum Diklaim / Unclaimed
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bisnis ini belum memiliki owner terdaftar di platform.
                  </p>
                </div>
              )}
            </div>

            {/* Input New Owner */}
            <Field>
              <FieldLabel htmlFor="detail-owner-email">Email Akun Owner Baru</FieldLabel>
              <Input
                id="detail-owner-email"
                type="email"
                placeholder="nama@contoh.com"
                value={ownerEmailInput}
                onChange={(e) => setOwnerEmailInput(e.target.value)}
                disabled={ownerSubmitting}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Masukkan email pengguna yang sudah terdaftar di KataMereka untuk ditetapkan sebagai Owner.
              </p>
            </Field>

            <Field>
              <FieldLabel htmlFor="detail-owner-reason">Alasan Perubahan (Opsional)</FieldLabel>
              <Input
                id="detail-owner-reason"
                placeholder="Contoh: Koreksi kepemilikan salah akun / request resmi via email"
                value={ownerReasonInput}
                onChange={(e) => setOwnerReasonInput(e.target.value)}
                disabled={ownerSubmitting}
              />
            </Field>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2 gap-2">
            <div>
              {currentOwner.isClaimed && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto border-destructive/40 text-destructive hover:bg-destructive/10"
                  onClick={handleUnclaimOwner}
                  disabled={ownerSubmitting}
                >
                  Lepas Kepemilikan (Unclaim)
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOwnerModalOpen(false)}
                disabled={ownerSubmitting}
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleSaveOwner}
                disabled={ownerSubmitting || !ownerEmailInput.trim()}
              >
                {ownerSubmitting ? "Menyimpan..." : "Tetapkan Owner"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
