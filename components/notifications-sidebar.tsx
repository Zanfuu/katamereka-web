"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  BellIcon,
  Building2Icon,
  CheckCircle2Icon,
  ClockIcon,
  ExternalLinkIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  XCircleIcon,
} from "lucide-react"

import {
  fetchMyBusinessClaims,
  cancelBusinessClaim,
  createBusinessClaim,
  type ApiMyBusinessClaim,
  type VerificationMethod,
} from "@/lib/api-client"
import { formatDateTime, timeAgo } from "@/lib/format"
import { useBusinessContext } from "@/components/business-provider"
import { businessActivity } from "@/lib/mock/activity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"

export function NotificationsSidebar() {
  const [open, setOpen] = React.useState(false)
  const [claims, setClaims] = React.useState<ApiMyBusinessClaim[]>([])
  const [loadingClaims, setLoadingClaims] = React.useState(true)
  const { selectedBusiness } = useBusinessContext()

  // Cancel dialog state
  const [cancelClaimId, setCancelClaimId] = React.useState<string | null>(null)
  const [cancelling, setCancelling] = React.useState(false)

  // Reclaim dialog state
  const [reclaimClaim, setReclaimClaim] = React.useState<ApiMyBusinessClaim | null>(null)
  const [reclaimMethod, setReclaimMethod] = React.useState<VerificationMethod>("DOCUMENT")
  const [reclaimProofUrl, setReclaimProofUrl] = React.useState("")
  const [reclaimMessage, setReclaimMessage] = React.useState("")
  const [reclaimSubmitting, setReclaimSubmitting] = React.useState(false)

  const loadClaims = React.useCallback(async () => {
    try {
      setLoadingClaims(true)
      const data = await fetchMyBusinessClaims()
      setClaims(data)
    } catch (err) {
      console.warn("Failed fetching claims in notification drawer:", err)
    } finally {
      setLoadingClaims(false)
    }
  }, [])

  React.useEffect(() => {
    loadClaims()
  }, [loadClaims])

  const pendingClaimsCount = claims.filter((c) => c.status === "PENDING").length
  const activities = (selectedBusiness && businessActivity[selectedBusiness.id]) ?? []
  const hasNotifications = claims.length > 0 || activities.length > 0

  async function handleConfirmCancel() {
    if (!cancelClaimId) return
    setCancelling(true)
    try {
      const res = await cancelBusinessClaim(cancelClaimId)
      if (res.success) {
        toast.success(res.message || "Pengajuan klaim berhasil dibatalkan.")
        setClaims((prev) =>
          prev.map((c) => (c.id === cancelClaimId ? { ...c, status: "CANCELLED" as const } : c))
        )
        setCancelClaimId(null)
        loadClaims()
      } else {
        toast.error(res.message || "Gagal membatalkan klaim")
      }
    } catch {
      toast.error("Terjadi kesalahan saat membatalkan klaim")
    } finally {
      setCancelling(false)
    }
  }

  async function handleConfirmReclaim() {
    if (!reclaimClaim?.business?.id) return
    setReclaimSubmitting(true)
    try {
      const res = await createBusinessClaim(reclaimClaim.business.id, {
        verification_method: reclaimMethod,
        proof_url: reclaimProofUrl.trim() || undefined,
        message: reclaimMessage.trim() || undefined,
      })
      if (res.success) {
        toast.success(res.message || "Klaim berhasil diajukan ulang, menunggu review admin.")
        setReclaimClaim(null)
        setReclaimProofUrl("")
        setReclaimMessage("")
        loadClaims()
      } else {
        toast.error(res.message || "Gagal mengajukan ulang klaim")
      }
    } catch {
      toast.error("Terjadi kesalahan saat mengajukan ulang klaim")
    } finally {
      setReclaimSubmitting(false)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <button
              type="button"
              aria-label="Notifikasi & Status Klaim"
              className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground cursor-pointer"
            >
              <BellIcon className="size-4.5" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  {pendingClaimsCount > 0 ? (
                    <>
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 ring-2 ring-background"></span>
                    </>
                  ) : (
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 ring-2 ring-background"></span>
                  )}
                </span>
              )}
            </button>
          }
        />

        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md w-full">
          <SheetHeader className="border-b p-4 pb-3 pr-12">
            <div className="flex items-center gap-2 flex-wrap">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <BellIcon className="size-4 text-primary" />
                Notifikasi Masuk
              </SheetTitle>
              {pendingClaimsCount > 0 && (
                <Badge className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5">
                  {pendingClaimsCount} Klaim Pending
                </Badge>
              )}
            </div>
            <SheetDescription className="text-xs">
              Status verifikasi klaim bisnis dan aktivitas terbaru Anda.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* 1. SEKSI STATUS KLAIM BISNIS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Status Klaim Bisnis
                </span>
                <Link
                  href="/klaim-bisnis"
                  onClick={() => setOpen(false)}
                  className="text-[11px] font-semibold text-[#008767] hover:underline flex items-center gap-1"
                >
                  <Building2Icon className="size-3" />
                  Klaim Bisnis Baru
                </Link>
              </div>

              {loadingClaims ? (
                <div className="rounded-xl border p-4 text-center text-xs text-muted-foreground animate-pulse">
                  Memeriksa status klaim Anda...
                </div>
              ) : claims.length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-center space-y-2 bg-muted/20">
                  <p className="text-xs text-muted-foreground">Belum ada pengajuan klaim aktif.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<Link href="/klaim-bisnis" />}
                    onClick={() => setOpen(false)}
                    className="text-xs"
                  >
                    Cari & Klaim Bisnis Anda
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => {
                    const isPending = claim.status === "PENDING"
                    const isApproved = claim.status === "APPROVED"
                    const isRejected = claim.status === "REJECTED"
                    const isCancelled = claim.status === "CANCELLED"

                    return (
                      <Card
                        key={claim.id}
                        className={`overflow-hidden border transition-all ${
                          isPending
                            ? "border-amber-300 bg-amber-50/40"
                            : isRejected
                            ? "border-rose-200 bg-rose-50/30"
                            : isApproved
                            ? "border-emerald-200 bg-emerald-50/20"
                            : "border-border bg-card"
                        }`}
                      >
                        <CardContent className="p-3.5 space-y-2.5">
                          {/* Nama & Status */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-xs text-foreground line-clamp-1">
                              {claim.business?.name || "Bisnis Tanpa Nama"}
                            </span>

                            {isPending && (
                              <Badge className="bg-amber-500 text-white text-[10px] shrink-0 font-medium">
                                Pending
                              </Badge>
                            )}
                            {isApproved && (
                              <Badge className="bg-[#008767] text-white text-[10px] shrink-0 font-medium">
                                Disetujui
                              </Badge>
                            )}
                            {isRejected && (
                              <Badge variant="destructive" className="text-[10px] shrink-0 font-medium">
                                Ditolak
                              </Badge>
                            )}
                            {isCancelled && (
                              <Badge variant="outline" className="text-muted-foreground text-[10px] shrink-0">
                                Dibatalkan
                              </Badge>
                            )}
                          </div>

                          {/* Detail & Tanggal */}
                          <div className="text-[11px] text-muted-foreground space-y-1">
                            <div className="flex items-center justify-between">
                              <span>Metode: <strong className="text-foreground">{claim.verification_method || "-"}</strong></span>
                              <span>{formatDateTime(claim.created_at)}</span>
                            </div>

                            {claim.business?.slug && (
                              <Link
                                href={`/business/${claim.business.slug}`}
                                target="_blank"
                                className="inline-flex items-center gap-1 text-[#008767] hover:underline font-medium text-[11px]"
                              >
                                Lihat Profil Publik <ExternalLinkIcon className="size-3" />
                              </Link>
                            )}
                          </div>

                          {/* Kotak Pesan Info Status */}
                          {isPending && (
                            <div className="text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-lg flex items-start gap-1.5">
                              <ClockIcon className="size-3.5 shrink-0 mt-0.5 text-amber-700" />
                              <span>Sedang diperiksa tim verifikasi. Estimasi 1-2 hari kerja.</span>
                            </div>
                          )}

                          {isRejected && (
                            <div className="text-[11px] text-rose-800 bg-rose-100/70 p-2 rounded-lg space-y-0.5">
                              <div className="flex items-center gap-1 font-bold text-rose-900">
                                <ShieldAlertIcon className="size-3.5 shrink-0 text-rose-700" />
                                <span>Alasan Penolakan:</span>
                              </div>
                              <p className="pl-4">
                                {claim.admin_notes || "Berkas bukti yang dilampirkan belum memenuhi syarat validasi."}
                              </p>
                            </div>
                          )}

                          {/* Tombol Aksi */}
                          <div className="pt-1 flex items-center justify-end gap-2">
                            {isPending && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => setCancelClaimId(claim.id)}
                                className="text-[11px] border-amber-300 text-amber-800 hover:bg-amber-100 cursor-pointer"
                              >
                                Batalkan Klaim
                              </Button>
                            )}

                            {isRejected && (
                              <Button
                                size="xs"
                                onClick={() => {
                                  setReclaimClaim(claim)
                                  setReclaimMethod((claim.verification_method as VerificationMethod) || "DOCUMENT")
                                  setReclaimProofUrl(claim.proof_url || "")
                                  setReclaimMessage("")
                                }}
                                className="text-[11px] bg-[#008767] hover:bg-[#007458] text-white flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcwIcon className="size-3" />
                                Ajukan Ulang
                              </Button>
                            )}

                            {isApproved && (
                              <Button
                                size="xs"
                                render={<Link href="/dashboard/business" />}
                                onClick={() => setOpen(false)}
                                className="text-[11px] bg-[#008767] hover:bg-[#007458] text-white cursor-pointer"
                              >
                                Kelola Profil Bisnis
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 2. SEKSI AKTIVITAS LAINNYA */}
            <div className="space-y-3 pt-2 border-t">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Aktivitas Terbaru
              </span>

              {activities.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Belum ada aktivitas baru.
                </p>
              ) : (
                <div className="space-y-2">
                  {activities.slice(0, 5).map((act) => (
                    <div key={act.id} className="p-2.5 rounded-lg border bg-muted/20 space-y-0.5">
                      <p className="text-xs text-foreground/90">{act.text}</p>
                      <p className="text-[10px] text-muted-foreground">{timeAgo(act.at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelClaimId} onOpenChange={(val) => !val && setCancelClaimId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Pengajuan Klaim?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan pengajuan klaim untuk bisnis ini? Anda dapat mengajukannya kembali kapan saja.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setCancelClaimId(null)} disabled={cancelling}>
              Kembali
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling ? "Membatalkan..." : "Ya, Batalkan Klaim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reclaim Modal Dialog */}
      <Dialog open={!!reclaimClaim} onOpenChange={(val) => !val && setReclaimClaim(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Ulang Klaim {reclaimClaim?.business?.name}</DialogTitle>
            <DialogDescription>
              Perbarui metode verifikasi atau lampirkan berkas bukti kepemilikan yang lebih jelas.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="drawer-reclaim-method">Metode Verifikasi</Label>
              <Select
                value={reclaimMethod}
                onValueChange={(v) => v && setReclaimMethod(v as VerificationMethod)}
              >
                <SelectTrigger id="drawer-reclaim-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DOCUMENT">Dokumen Resmi (NIB, SIUP, KTP)</SelectItem>
                  <SelectItem value="WEBSITE">Website Resmi Bisnis</SelectItem>
                  <SelectItem value="EMAIL">Email Domain Bisnis</SelectItem>
                  <SelectItem value="PHONE">Nomor Telepon Resmi</SelectItem>
                  <SelectItem value="OTHER">Metode Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="drawer-reclaim-proof">Link Dokumen Bukti Baru</Label>
              <Input
                id="drawer-reclaim-proof"
                type="url"
                placeholder="https://drive.google.com/..."
                value={reclaimProofUrl}
                onChange={(e) => setReclaimProofUrl(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="drawer-reclaim-msg">Catatan Perbaikan untuk Admin</Label>
              <Textarea
                id="drawer-reclaim-msg"
                rows={3}
                placeholder="Jelaskan perbaikan berkas Anda..."
                value={reclaimMessage}
                onChange={(e) => setReclaimMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setReclaimClaim(null)} disabled={reclaimSubmitting}>
              Batal
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmReclaim}
              disabled={reclaimSubmitting}
              className="bg-[#008767] hover:bg-[#007458] text-white"
            >
              {reclaimSubmitting ? "Mengirimkan..." : "Kirim Pengajuan Ulang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
