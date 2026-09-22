"use client"

import { use } from "react"
import { SendIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import { formatDateTime } from "@/lib/format"
import { getInvitationsByBusiness } from "@/lib/mock/invitations"
import type { Invitation } from "@/lib/types"

const columns: ResourceTableColumn<Invitation>[] = [
  {
    key: "customerName",
    header: "Customer",
    render: (invitation) => (
      <div>
        <p className="font-medium text-foreground">{invitation.customerName}</p>
        <p className="text-xs text-muted-foreground">{invitation.contact}</p>
      </div>
    ),
  },
  { key: "referenceId", header: "Reference", render: (invitation) => invitation.referenceId ?? "-" },
  { key: "channel", header: "Channel", render: (invitation) => <StatusBadge status="gray" label={invitation.channel} /> },
  {
    key: "sentAt",
    header: "Sent At",
    sortValue: (i) => i.sentAt,
    render: (invitation) => (
      <span className="text-muted-foreground">{formatDateTime(invitation.sentAt)}</span>
    ),
  },
  { key: "status", header: "Status", render: (invitation) => <StatusBadge status={invitation.status} /> },
  {
    key: "reviewGenerated",
    header: "Review Generated",
    render: (invitation) => <StatusBadge status={invitation.reviewGenerated ? "green" : "gray"} label={invitation.reviewGenerated ? "Ya" : "Belum"} />,
  },
]

export default function BusinessDetailInvitationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const invitations = getInvitationsByBusiness(id)

  if (invitations.length === 0) {
    return <EmptyState icon={SendIcon} title="Belum ada invitation yang dikirim untuk bisnis ini." />
  }

  return <ResourceTable data={invitations} columns={columns} getRowId={(invitation) => invitation.id} />
}
