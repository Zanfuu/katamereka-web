import { UsersIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import { formatDate } from "@/lib/format"
import { getMembersByBusiness } from "@/lib/mock/businesses"
import type { BusinessMember } from "@/lib/types"

const columns: ResourceTableColumn<BusinessMember>[] = [
  {
    key: "name",
    header: "Name",
    render: (member) => (
      <div>
        <p className="font-medium text-foreground">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.email}</p>
      </div>
    ),
  },
  { key: "role", header: "Role", render: (member) => <StatusBadge status={member.role} /> },
  { key: "status", header: "Status", render: (member) => <StatusBadge status={member.status} /> },
  {
    key: "joinedAt",
    header: "Joined At",
    sortValue: (member) => member.joinedAt,
    render: (member) => (
      <span className="text-muted-foreground">{formatDate(member.joinedAt)}</span>
    ),
  },
]

export default async function BusinessDetailTeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const members = getMembersByBusiness(id)

  if (members.length === 0) {
    return <EmptyState icon={UsersIcon} title="Belum ada anggota tim untuk bisnis ini." />
  }

  return (
    <ResourceTable data={members} columns={columns} getRowId={(member) => member.id} />
  )
}
