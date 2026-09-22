"use client"

import { FlagIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/format"
import { getReportsByBusiness } from "@/lib/mock/reports"
import type { Report } from "@/lib/types"

const columns: ResourceTableColumn<Report>[] = [
  {
    key: "review",
    header: "Review",
    render: (report) => (
      <div className="max-w-sm">
        <p className="text-sm font-medium text-foreground">{report.reviewerName}</p>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {report.reviewExcerpt}
        </p>
      </div>
    ),
  },
  {
    key: "reason",
    header: "Reason",
    render: (report) => (
      <span className="line-clamp-2 max-w-xs text-sm text-foreground/90">
        {report.reason}
      </span>
    ),
  },
  {
    key: "createdAt",
    header: "Reported At",
    sortValue: (report) => report.createdAt,
    render: (report) => (
      <span className="text-sm text-muted-foreground">{formatDate(report.createdAt)}</span>
    ),
  },
  {
    key: "moderationStatus",
    header: "Moderation Status",
    render: (report) => <StatusBadge status={report.moderationStatus} />,
  },
]

export default function AdminReportedReviewsPage() {
  const { selectedBusiness } = useBusinessContext()
  if (!selectedBusiness) return null

  const reports = getReportsByBusiness(selectedBusiness.id)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Review Dilaporkan"
        description="Review yang sebelumnya kamu laporkan, beserta hasil moderasi dari tim KataMereka."
      />

      <ResourceTable
        data={reports}
        columns={columns}
        getRowId={(report) => report.id}
        emptyTitle="Tidak ada review yang sedang dilaporkan."
        emptyDescription="Review yang kamu laporkan akan muncul di sini beserta status moderasinya."
      />
      {reports.length === 0 && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <FlagIcon className="size-4" />
          Hasil moderasi ditentukan sepenuhnya oleh tim KataMereka.
        </p>
      )}
    </div>
  )
}
