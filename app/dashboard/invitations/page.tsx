"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ClockIcon,
  MailOpenIcon,
  SendIcon,
  SlidersHorizontalIcon,
  StarIcon,
  UserPlusIcon,
} from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { DashboardBreadcrumb } from "@/components/dashboard-breadcrumb"
import { DateRangeSelector } from "@/components/date-range-selector"
import { FilterDropdown } from "@/components/filter-dropdown"
import { InviteCustomerPanel } from "@/components/invite-customer-panel"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { SearchInput } from "@/components/search-input"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDateTime } from "@/lib/format"
import { CHANNEL_META } from "@/lib/invitation-channels"
import { getInvitationsByBusiness } from "@/lib/mock/invitations"
import type { Invitation, InvitationChannel, InvitationStatus } from "@/lib/types"

const TABS = [
  { value: "all", label: "Semua" },
  { value: "SENT", label: "Sent" },
  { value: "OPENED", label: "Opened" },
  { value: "COMPLETED", label: "Completed" },
  { value: "EXPIRED", label: "Expired" },
] as const satisfies { value: "all" | InvitationStatus; label: string }[]

const CHANNEL_OPTIONS = [
  { value: "all", label: "Semua Channel" },
  ...(Object.keys(CHANNEL_META) as InvitationChannel[]).map((key) => ({
    value: key,
    label: CHANNEL_META[key].label,
  })),
]

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "SENT", label: "Sent" },
  { value: "OPENED", label: "Opened" },
  { value: "COMPLETED", label: "Completed" },
  { value: "EXPIRED", label: "Expired" },
]

export default function DashboardInvitationsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [tab, setTab] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [channelFilter, setChannelFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [panelOpen, setPanelOpen] = React.useState(false)
  const [advancedOpen, setAdvancedOpen] = React.useState(false)
  const [reviewOnly, setReviewOnly] = React.useState(false)

  if (!selectedBusiness) return null

  const invitations = getInvitationsByBusiness(selectedBusiness.id)
  const counts = {
    all: invitations.length,
    SENT: invitations.filter((i) => i.status === "SENT").length,
    OPENED: invitations.filter((i) => i.status === "OPENED").length,
    COMPLETED: invitations.filter((i) => i.status === "COMPLETED").length,
    EXPIRED: invitations.filter((i) => i.status === "EXPIRED").length,
  }

  const filtered = invitations.filter((inv) => {
    if (tab !== "all" && inv.status !== tab) return false
    if (channelFilter !== "all" && inv.channel !== channelFilter) return false
    if (statusFilter !== "all" && inv.status !== statusFilter) return false
    if (reviewOnly && !inv.reviewGenerated) return false
    if (
      search &&
      !inv.customerName.toLowerCase().includes(search.toLowerCase()) &&
      !inv.contact.toLowerCase().includes(search.toLowerCase()) &&
      !(inv.referenceId ?? "").toLowerCase().includes(search.toLowerCase())
    )
      return false
    return true
  })

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )

  const columns: ResourceTableColumn<Invitation>[] = [
    {
      key: "customerName",
      header: "Customer",
      sortValue: (inv) => inv.customerName,
      render: (inv) => (
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
            {inv.customerName
              .split(" ")
              .map((p) => p[0])
              .slice(0, 2)
              .join("")}
          </span>
          <span className="font-medium text-foreground">{inv.customerName}</span>
        </div>
      ),
    },
    { key: "contact", header: "Contact", render: (inv) => <span className="text-muted-foreground">{inv.contact}</span> },
    {
      key: "channel",
      header: "Channel",
      render: (inv) => {
        const meta = CHANNEL_META[inv.channel]
        return (
          <span className="flex items-center gap-1.5 text-sm text-foreground/90">
            <meta.icon className="size-3.5 text-muted-foreground" />
            {meta.label}
          </span>
        )
      },
    },
    { key: "referenceId", header: "Reference ID", render: (inv) => inv.referenceId ?? "-" },
    {
      key: "status",
      header: "Status",
      render: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      key: "sentAt",
      header: "Sent At",
      sortValue: (inv) => inv.sentAt,
      render: (inv) => (
        <span className="text-muted-foreground">{formatDateTime(inv.sentAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (inv) => (
        <div className="flex justify-end">
          {inv.status === "SENT" || inv.status === "OPENED" || inv.status === "EXPIRED" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Undangan untuk ${inv.customerName} dikirim ulang.`)}
            >
              Kirim Ulang
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {inv.reviewGenerated ? "Review diterima" : "-"}
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <DashboardBreadcrumb items={[{ label: "Invitations" }]} />

      <PageHeader
        title="Invitations"
        description="Undang pelanggan Anda untuk memberikan review dan bangun reputasi bisnis yang lebih kuat."
        action={
          <Button onClick={() => setPanelOpen(true)}>
            <UserPlusIcon />
            Undang Customer
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard
          label="Total Sent"
          value={counts.all.toLocaleString("id-ID")}
          delta="+12% dari bulan lalu"
          icon={SendIcon}
        />
        <StatCard
          label="Opened"
          value={counts.OPENED.toLocaleString("id-ID")}
          delta="+8% dari bulan lalu"
          icon={MailOpenIcon}
          onClick={() => setTab("OPENED")}
        />
        <StatCard
          label="Completed"
          value={counts.COMPLETED.toLocaleString("id-ID")}
          delta="+15% dari bulan lalu"
          icon={StarIcon}
          onClick={() => setTab("COMPLETED")}
        />
        <StatCard
          label="Expired"
          value={counts.EXPIRED.toLocaleString("id-ID")}
          delta="+5% dari bulan lalu"
          deltaTone="negative"
          iconTone="destructive"
          icon={ClockIcon}
          onClick={() => setTab("EXPIRED")}
        />
      </div>

      <Tabs value={tab} onValueChange={(value) => typeof value === "string" && setTab(value)}>
        <TabsList variant="line">
          {TABS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label} ({option.value === "all" ? counts.all : counts[option.value]})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari nama, email, atau reference ID..."
          className="sm:max-w-64"
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Channel"
            options={CHANNEL_OPTIONS}
            value={channelFilter}
            onChange={setChannelFilter}
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <DateRangeSelector />
          <Button variant="outline" size="sm" onClick={() => setAdvancedOpen(true)}>
            <SlidersHorizontalIcon />
            Filter
            {reviewOnly && <span className="ml-0.5 size-1.5 rounded-full bg-primary" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ResourceTable
            data={sorted}
            columns={columns}
            getRowId={(inv) => inv.id}
            itemLabel="undangan"
            pageSize={10}
            emptyTitle="Belum ada undangan dikirim."
            emptyDescription="Undang pelanggan yang sudah bertransaksi untuk memberikan review."
          />
        </div>
        {panelOpen && (
          <InviteCustomerPanel
            businessName={selectedBusiness.name}
            onClose={() => setPanelOpen(false)}
          />
        )}
      </div>

      <Dialog open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Lanjutan</DialogTitle>
          </DialogHeader>
          <label
            htmlFor="review-only-filter"
            className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-border p-3"
          >
            <span>
              <span className="block text-sm font-medium text-foreground">
                Hanya undangan yang menghasilkan review
              </span>
              <span className="block text-xs text-muted-foreground">
                Sembunyikan undangan yang belum berujung pada review.
              </span>
            </span>
            <Checkbox
              id="review-only-filter"
              checked={reviewOnly}
              onCheckedChange={(checked) => setReviewOnly(!!checked)}
            />
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOnly(false)}>
              Reset
            </Button>
            <Button onClick={() => setAdvancedOpen(false)}>Terapkan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
