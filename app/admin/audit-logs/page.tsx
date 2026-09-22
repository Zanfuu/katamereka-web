"use client"

import * as React from "react"
import Link from "next/link"
import { HomeIcon } from "lucide-react"

import { DateRangeSelector } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatusBadge } from "@/components/status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { auditLog } from "@/lib/mock/audit-log"
import { formatDateTime } from "@/lib/format"
import type { AuditLogEntry } from "@/lib/types"

const ROLE_OPTIONS = [
  { value: "all", label: "Semua Role" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "USER", label: "Business Admin" },
]

export default function AdminAuditLogsPage() {
  const [search, setSearch] = React.useState("")
  const [actorFilter, setActorFilter] = React.useState("all")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [actionFilter, setActionFilter] = React.useState("all")

  const actorOptions = [
    { value: "all", label: "Semua Actor" },
    ...Array.from(new Set(auditLog.map((entry) => entry.actorName))).map((name) => ({
      value: name,
      label: name,
    })),
  ]

  const actionOptions = [
    { value: "all", label: "Semua Action" },
    ...Array.from(new Set(auditLog.map((entry) => entry.action))).map((action) => ({
      value: action,
      label: action,
    })),
  ]

  const filtered = auditLog.filter((entry) => {
    if (actorFilter !== "all" && entry.actorName !== actorFilter) return false
    if (roleFilter !== "all" && entry.actorRole !== roleFilter) return false
    if (actionFilter !== "all" && entry.action !== actionFilter) return false
    if (
      search &&
      !entry.actorName.toLowerCase().includes(search.toLowerCase()) &&
      !entry.target.toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const columns: ResourceTableColumn<AuditLogEntry>[] = [
    {
      key: "actorName",
      header: "Actor",
      sortValue: (e) => e.actorName,
      render: (entry) => <span className="font-medium text-foreground">{entry.actorName}</span>,
    },
    {
      key: "actorRole",
      header: "Role",
      render: (entry) => (
        <StatusBadge status={entry.actorRole} label={entry.actorRole === "SUPER_ADMIN" ? "Super Admin" : "Business Admin"} />
      ),
    },
    { key: "action", header: "Action", render: (entry) => entry.action },
    {
      key: "target",
      header: "Target",
      render: (entry) => <span className="text-muted-foreground">{entry.target}</span>,
    },
    {
      key: "timestamp",
      header: "Date & Time",
      sortValue: (e) => e.timestamp,
      render: (entry) => (
        <span className="text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
      ),
    },
    {
      key: "ip",
      header: "IP",
      render: (entry) => <span className="text-muted-foreground">{entry.ip}</span>,
    },
    {
      key: "detail",
      header: "Detail",
      render: (entry) => (
        <span className="text-muted-foreground">{entry.metadata ?? "—"}</span>
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
            <BreadcrumbPage>Audit Logs</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title="Audit Logs"
        description="Catatan seluruh tindakan sensitif pada platform KataMereka. Read-only."
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari actor atau target..." />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown label="Actor" options={actorOptions} value={actorFilter} onChange={setActorFilter} />
          <FilterDropdown label="Role" options={ROLE_OPTIONS} value={roleFilter} onChange={setRoleFilter} />
          <FilterDropdown label="Action" options={actionOptions} value={actionFilter} onChange={setActionFilter} />
          <DateRangeSelector />
        </div>
      </div>

      <ResourceTable
        data={filtered}
        columns={columns}
        getRowId={(entry) => entry.id}
        itemLabel="log"
        pageSize={10}
        emptyTitle="Tidak ada log ditemukan."
        emptyDescription="Coba ubah filter pencarian."
      />
    </div>
  )
}
