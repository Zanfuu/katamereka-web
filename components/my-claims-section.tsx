"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import {
  AlertCircleIcon,
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
import { formatDateTime } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"

interface MyClaimsSectionProps {
  onClaimsLoaded?: (claims: ApiMyBusinessClaim[]) => void
  showTitle?: boolean
  hideIfNoClaims?: boolean
}

export function MyClaimsSection({
  onClaimsLoaded,
  showTitle = true,
  hideIfNoClaims = false,
}: MyClaimsSectionProps) {
  const [claims, setClaims] = React.useState<ApiMyBusinessClaim[]>([])
  const [loading, setLoading] = React.useState(true)

  // Cancel dialog state
  const [cancelClaimId, setCancelClaimId] = React.useState<string | null>(null)
  const [cancelling, setCancelling] = React.useState(false)

  // Resubmit dialog state
  const [reclaimClaim, setReclaimClaim] = React.useState<ApiMyBusinessClaim | null>(null)
  const [reclaimMethod, setReclaimMethod] = React.useState<VerificationMethod>("DOCUMENT")
  const [reclaimProofUrl, setReclaimProofUrl] = React.useState("")
  const [reclaimMessage, setReclaimMessage] = React.useState("")
  const [reclaimSubmitting, setReclaimSubmitting] = React.useState(false)

  const loadClaims = React.useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchMyBusinessClaims()
      setClaims(data)
      onClaimsLoaded?.(data)
    } catch (err) {
      console.warn("Failed fetching claims:", err)
    } finally {
      setLoading(false)
    }
  }, [onClaimsLoaded])

  React.useEffect(() => {
    loadClaims()
  }, [loadClaims])

  async function handleConfirmCancel() {
    if (!cancelClaimId) return
    setCancelling(true)
    try {
      const res = await cancelBusinessClaim(cancelClaimId)
      if (res.success) {
        toast.success(res.message || "Pengajuan klaim berhasil dibatalkan.")
        // Optimistic update
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

  if (loading) {
    return (
      <Card className="border-border">
        <CardContent className="p-6 text-center text-xs text-muted-foreground">
          Memuat status klaim bisnis Anda...
        </CardContent>
      </Card>
    )
  }

  if (claims.length === 0 && hideIfNoClaims) {
    return null
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Status Klaim Bisnis</h3>
            <p className="text-xs text-muted-foreground">
              Pantau proses pengajuan verifikasi kepemilikan bisnis Anda di sini.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/klaim-bisnis" />}
            className="text-xs"
          >
            <Building2Icon className="mr-1 size-3.5" />
            Cari & Klaim Bisnis Lain
          </Button>
        </div>
      )}

      {claims.length === 0 ? (
        <Card className="border-dashed border-2 bg-secondary/30">
          <CardContent className="p-8 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
              <Building2Icon className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Belum Ada Pengajuan Klaim</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                Anda belum pernah mengajukan klaim bisnis. Temukan cabang atau bisnis Anda di direktori untuk mulai mengelola profil dan membalas ulasan.
              </p>
            </div>
            <Button
              size="sm"
              render={<Link href="/klaim-bisnis" />}
              className="mt-2 bg-[#008767] hover:bg-[#007458] text-white"
            >
              Cari & Klaim Bisnis Anda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {claims.map((claim) => {
            const isPending = claim.status === "PENDING"
            const isApproved = claim.status === "APPROVED"
            const isRejected = claim.status === "REJECTED"
            const isCancelled = claim.status === "CANCELLED"

            return (
              <Card
                key={claim.id}
                className={`overflow-hidden transition-all border ${
                  isPending
                    ? "border-amber-300 bg-amber-50/40"
                    : isRejected
                    ? "border-rose-200 bg-rose-50/30"
                    : isApproved
                    ? "border-emerald-200 bg-emerald-50/20"
                    : "border-border bg-card"
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left Detail */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-foreground truncate">
                        {claim.business?.name || "Bisnis Tanpa Nama"}
                      </span>
                      {/* Status Badges */}
                      {isPending && (
                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1 text-[11px] font-semibold">
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                          Menunggu Review Admin
                        </Badge>
                      )}
                      {isApproved && (
                        <Badge className="bg-[#008767] hover:bg-[#007055] text-white flex items-center gap-1 text-[11px] font-semibold">
                          <CheckCircle2Icon className="size-3.5" />
                          Disetujui
                        </Badge>
                      )}
                      {isRejected && (
                        <Badge variant="destructive" className="flex items-center gap-1 text-[11px] font-semibold">
                          <XCircleIcon className="size-3.5" />
                          Ditolak
                        </Badge>
                      )}
                      {isCancelled && (
                        <Badge variant="outline" className="text-muted-foreground flex items-center gap-1 text-[11px] font-semibold">
                          Dibatalkan
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Metode: <strong className="text-foreground">{claim.verification_method || "-"}</strong></span>
                      <span>Diajukan: {formatDateTime(claim.created_at)}</span>
                      {claim.business?.slug && (
                        <Link
                          href={`/business/${claim.business.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[#008767] hover:underline"
                        >
                          Lihat Profil Publik <ExternalLinkIcon className="size-3" />
                        </Link>
                      )}
                    </div>

                    {/* Information / Admin Notes */}
                    {isPending && (
                      <p className="text-xs text-amber-800 bg-amber-100/70 p-2.5 rounded-lg flex items-start gap-2 mt-2">
                        <ClockIcon className="size-4 shrink-0 mt-0.5 text-amber-700" />
                        <span>
                          Pengajuan Anda sedang diperiksa oleh tim verifikasi KataMereka. Proses verifikasi biasanya membutuhkan waktu 1-2 hari kerja.
                        </span>
                      </p>
                    )}

                    {isRejected && (
                      <div className="text-xs text-rose-800 bg-rose-100/70 p-2.5 rounded-lg space-y-1 mt-2">
                        <div className="flex items-center gap-1.5 font-bold text-rose-900">
                          <ShieldAlertIcon className="size-4 shrink-0 text-rose-700" />
                          <span>Alasan Penolakan:</span>
                        </div>
                        <p className="pl-5 text-rose-800">
                          {claim.admin_notes || "Dokumen bukti kepemilikan yang dilampirkan belum memenuhi syarat validasi."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                    {isPending && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCancelClaimId(claim.id)}
                        className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                      >
                        Batalkan Klaim
                      </Button>
                    )}

                    {isRejected && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setReclaimClaim(claim)
                          setReclaimMethod((claim.verification_method as VerificationMethod) || "DOCUMENT")
                          setReclaimProofUrl(claim.proof_url || "")
                          setReclaimMessage("")
                        }}
                        className="text-xs bg-[#008767] hover:bg-[#007458] text-white flex items-center gap-1.5"
                      >
                        <RotateCcwIcon className="size-3.5" />
                        Ajukan Ulang
                      </Button>
                    )}

                    {isApproved && (
                      <Button
                        size="sm"
                        render={<Link href="/dashboard/business" />}
                        className="text-xs bg-[#008767] hover:bg-[#007458] text-white"
                      >
                        Kelola Bisnis
                      </Button>
                    )}

                    {isCancelled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReclaimClaim(claim)
                          setReclaimMethod("DOCUMENT")
                          setReclaimProofUrl("")
                          setReclaimMessage("")
                        }}
                        className="text-xs"
                      >
                        Ajukan Lagi
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelClaimId} onOpenChange={(open) => !open && setCancelClaimId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Batalkan Pengajuan Klaim?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan pengajuan klaim untuk bisnis ini? Anda dapat mengajukannya kembali di masa mendatang.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelClaimId(null)} disabled={cancelling}>
              Tidak, Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling ? "Membatalkan..." : "Ya, Batalkan Klaim"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reclaim Modal Dialog */}
      <Dialog open={!!reclaimClaim} onOpenChange={(open) => !open && setReclaimClaim(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajukan Ulang Klaim {reclaimClaim?.business?.name}</DialogTitle>
            <DialogDescription>
              Perbarui metode atau lampirkan berkas bukti kepemilikan yang valid untuk ditinjau kembali oleh admin.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reclaim-method">Metode Verifikasi</Label>
              <Select
                value={reclaimMethod}
                onValueChange={(v) => v && setReclaimMethod(v as VerificationMethod)}
              >
                <SelectTrigger id="reclaim-method">
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
              <Label htmlFor="reclaim-proof-url">Link Dokumen / Bukti Baru (Google Drive / Dropbox)</Label>
              <Input
                id="reclaim-proof-url"
                type="url"
                placeholder="https://drive.google.com/..."
                value={reclaimProofUrl}
                onChange={(e) => setReclaimProofUrl(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">
                Pastikan izin akses link dapat dibuka oleh publik/admin.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="reclaim-message">Catatan Perbaikan untuk Admin (opsional)</Label>
              <Textarea
                id="reclaim-message"
                rows={3}
                placeholder="Contoh: Dokumen NIB baru yang lebih jelas telah dilampirkan..."
                value={reclaimMessage}
                onChange={(e) => setReclaimMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReclaimClaim(null)} disabled={reclaimSubmitting}>
              Batal
            </Button>
            <Button
              onClick={handleConfirmReclaim}
              disabled={reclaimSubmitting}
              className="bg-[#008767] hover:bg-[#007458] text-white"
            >
              {reclaimSubmitting ? "Mengirimkan..." : "Kirim Pengajuan Ulang"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
