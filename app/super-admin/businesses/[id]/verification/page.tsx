"use client"

import * as React from "react"
import { use } from "react"
import { toast } from "sonner"
import { FileIcon, ShieldCheckIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import { getVerificationByBusiness } from "@/lib/mock/verifications"

export default function BusinessDetailVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [dialog, setDialog] = React.useState<"APPROVE" | "REJECT" | null>(null)
  const request = getVerificationByBusiness(id)

  if (!request) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Bisnis ini belum pernah mengajukan verifikasi.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Verification Request</CardTitle>
          <StatusBadge status={request.status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Submitted By</p>
              <p className="text-sm font-medium text-foreground">{request.submittedBy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted At</p>
              <p className="text-sm font-medium text-foreground">
                {formatDate(request.submittedAt)}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-muted-foreground">Submitted Documents</p>
            <div className="flex flex-col gap-2">
              {request.documents.map((doc) => (
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
          </div>

          {request.status === "PENDING" && (
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => toast.info("Permintaan dokumen tambahan telah dikirim ke admin.")}
              >
                Request Additional Information
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verification History</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {request.history.map((entry, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <StatusBadge status={entry.status} />
                <span className="text-foreground/90">{entry.note}</span>
              </div>
              <span className="text-xs text-muted-foreground">{formatDate(entry.at)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog === "APPROVE" ? `Setujui verifikasi ${request.businessName}?` : `Tolak verifikasi ${request.businessName}?`}
        confirmLabel={dialog === "APPROVE" ? "Approve" : "Reject"}
        variant={dialog === "APPROVE" ? "default" : "destructive"}
        requireReason={dialog === "REJECT"}
        reasonLabel="Alasan penolakan"
        onConfirm={() =>
          toast.success(
            dialog === "APPROVE"
              ? `${request.businessName} berhasil diverifikasi.`
              : `Verifikasi ${request.businessName} ditolak.`
          )
        }
      />
    </div>
  )
}
