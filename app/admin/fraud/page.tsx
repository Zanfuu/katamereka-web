"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HomeIcon } from "lucide-react"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
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
import { formatDate } from "@/lib/format"
import { fraudFlags } from "@/lib/mock/fraud"
import type { FraudFlag } from "@/lib/types"

export default function AdminFraudPage() {
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
            <BreadcrumbPage>Fraud</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Fraud Detection"
        description="Deteksi aktivitas mencurigakan di platform. Risk score hanya indikator, bukan keputusan otomatis."
      />

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
