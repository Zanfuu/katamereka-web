"use client"

import { CheckIcon, FileIcon, ShieldCheckIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"

import { useBusinessContext } from "@/components/business-provider"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { getVerificationByBusiness } from "@/lib/mock/verifications"

const REQUIRED_DOCUMENTS = [
  "Nomor Induk Berusaha (NIB) atau SIUP",
  "KTP pemilik / penanggung jawab bisnis",
  "Bukti kepemilikan atau sewa lokasi usaha",
]

export default function AdminVerificationPage() {
  const { selectedBusiness } = useBusinessContext()
  if (!selectedBusiness) return null

  const request = getVerificationByBusiness(selectedBusiness.id)
  const status = request?.status ?? selectedBusiness.verificationStatus

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Verifikasi Bisnis"
        description="Ajukan dan pantau status verifikasi bisnis kamu di KataMereka."
      />

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Current Verification Status</CardTitle>
          <StatusBadge status={status} />
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-lg text-sm text-muted-foreground">
            {status === "VERIFIED" &&
              "Bisnis kamu sudah terverifikasi. Badge verifikasi akan tampil di halaman publik."}
            {status === "PENDING" &&
              "Dokumen kamu sedang ditinjau oleh tim KataMereka. Proses biasanya memakan waktu 2-3 hari kerja."}
            {status === "REJECTED" &&
              (request?.reason ??
                "Pengajuan verifikasi sebelumnya ditolak. Silakan ajukan ulang dengan dokumen yang lebih lengkap.")}
            {status === "UNVERIFIED" &&
              "Bisnis kamu belum diverifikasi. Ajukan verifikasi untuk meningkatkan kepercayaan customer."}
          </p>
          {status !== "VERIFIED" && status !== "PENDING" && (
            <Button onClick={() => toast.success("Pengajuan verifikasi berhasil dikirim.")}>
              <ShieldCheckIcon />
              {status === "REJECTED" ? "Resubmit Verification" : "Submit Verification"}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Required Documents</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {REQUIRED_DOCUMENTS.map((doc) => (
            <div key={doc} className="flex items-center gap-2 text-sm text-foreground/90">
              <CheckIcon className="size-4 text-success" />
              {doc}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Uploaded Documents</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Dokumen berhasil diunggah.")}
          >
            <UploadIcon />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {(!request || request.documents.length === 0) && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada dokumen yang diunggah.
            </p>
          )}
          {request?.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between rounded-lg border border-border p-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <FileIcon className="size-4 text-muted-foreground" />
                {doc.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(doc.uploadedAt)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {(!request || request.history.length === 0) && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Belum ada riwayat pengajuan verifikasi.
            </p>
          )}
          {request?.history.map((entry, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ShieldCheckIcon className="size-3.5" />
                </span>
                {index < request.history.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="pb-3">
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(entry.at)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/90">{entry.note}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
