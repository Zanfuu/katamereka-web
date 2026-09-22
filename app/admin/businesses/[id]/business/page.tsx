"use client"

import { use } from "react"
import { MapPinIcon, UsersIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/format"
import {
  getBusinessById,
  getLocationsByBusiness,
  getMembersByBusiness,
} from "@/lib/mock/businesses"
import type { BusinessMember, Location } from "@/lib/types"

const memberColumns: ResourceTableColumn<BusinessMember>[] = [
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
    render: (member) => <span className="text-muted-foreground">{formatDate(member.joinedAt)}</span>,
  },
]

const locationColumns: ResourceTableColumn<Location>[] = [
  { key: "name", header: "Location", render: (l) => <span className="font-medium text-foreground">{l.name}</span> },
  { key: "city", header: "City", render: (l) => `${l.city}, ${l.province}` },
  { key: "averageRating", header: "Rating", render: (l) => l.averageRating.toFixed(1) },
  { key: "reviewCount", header: "Reviews", render: (l) => l.reviewCount.toLocaleString("id-ID") },
  { key: "status", header: "Status", render: (l) => <StatusBadge status={l.status} /> },
]

export default function BusinessDetailBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const business = getBusinessById(id)
  if (!business) return null

  const members = getMembersByBusiness(id)
  const locations = getLocationsByBusiness(id)

  const rows: [string, string][] = [
    ["Business Name", business.name],
    ["Slug", business.slug],
    ["Category", business.category],
    ["Website", business.website ?? "-"],
    ["Phone", business.phone ?? "-"],
    ["Email", business.email ?? "-"],
    ["Address", business.address],
    ["City", `${business.city}, ${business.province}`],
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-foreground/90">{business.description}</p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className="text-sm font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locations</CardTitle>
        </CardHeader>
        <CardContent>
          {locations.length === 0 ? (
            <EmptyState icon={MapPinIcon} title="Bisnis ini belum memiliki cabang." />
          ) : (
            <ResourceTable data={locations} columns={locationColumns} getRowId={(l) => l.id} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <EmptyState icon={UsersIcon} title="Belum ada anggota tim untuk bisnis ini." />
          ) : (
            <ResourceTable data={members} columns={memberColumns} getRowId={(member) => member.id} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
