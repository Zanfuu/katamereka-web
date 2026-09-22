"use client"

import * as React from "react"
import { toast } from "sonner"
import { UserPlusIcon, UsersIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { ResourceTable, type ResourceTableColumn } from "@/components/resource-table"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatDate } from "@/lib/format"
import { getMembersByBusiness } from "@/lib/mock/businesses"
import type { BusinessMember } from "@/lib/types"

export default function AdminTeamPage() {
  const { selectedBusiness } = useBusinessContext()
  const [removeTarget, setRemoveTarget] = React.useState<BusinessMember | null>(null)

  if (!selectedBusiness) return null

  const members = getMembersByBusiness(selectedBusiness.id)
  const pendingCount = members.filter((member) => member.status === "PENDING").length

  const columns: ResourceTableColumn<BusinessMember>[] = [
    {
      key: "name",
      header: "Name",
      sortValue: (member) => member.name,
      render: (member) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm">
            <AvatarFallback>
              {member.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-foreground">{member.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (member) => <span className="text-muted-foreground">{member.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (member) => <StatusBadge status={member.role} />,
    },
    {
      key: "status",
      header: "Status",
      render: (member) => <StatusBadge status={member.status} />,
    },
    {
      key: "joinedAt",
      header: "Joined At",
      sortValue: (member) => member.joinedAt,
      render: (member) => (
        <span className="text-muted-foreground">{formatDate(member.joinedAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (member) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
              Kelola
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => toast.success(`Role ${member.name} berhasil diubah.`)}
              >
                Change Role
              </DropdownMenuItem>
              {member.role !== "OWNER" && (
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setRemoveTarget(member)}
                >
                  Remove Member
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Anggota Tim"
        description="Atur user yang dapat mengakses dan mengelola bisnis kamu."
        action={<InviteMemberDialog />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Total Members" value={members.length} icon={UsersIcon} />
        <StatCard
          label="Pending Invitation"
          value={pendingCount}
          deltaTone="neutral"
          icon={UserPlusIcon}
        />
      </div>

      <ResourceTable
        data={members}
        columns={columns}
        getRowId={(member) => member.id}
        emptyTitle="Belum ada anggota tim."
        emptyDescription="Undang anggota tim untuk membantu mengelola bisnis."
      />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title={`Hapus ${removeTarget?.name} dari tim?`}
        description="Anggota yang dihapus akan langsung kehilangan akses ke dashboard bisnis ini."
        confirmLabel="Hapus Anggota"
        variant="destructive"
        onConfirm={() => toast.success(`${removeTarget?.name} berhasil dihapus dari tim.`)}
      />
    </div>
  )
}

function InviteMemberDialog() {
  const [open, setOpen] = React.useState(false)
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState("MEMBER")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlusIcon />
        Invite Member
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Undang Anggota Tim</DialogTitle>
        </DialogHeader>
        <Field>
          <FieldLabel htmlFor="invite-email">Email</FieldLabel>
          <Input
            id="invite-email"
            type="email"
            placeholder="nama@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="invite-role">Role</FieldLabel>
          <Select value={role} onValueChange={(value) => setRole(value as string)}>
            <SelectTrigger id="invite-role" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="MEMBER">Member</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={email.trim().length === 0}
            onClick={() => {
              toast.success(`Undangan berhasil dikirim ke ${email}.`)
              setEmail("")
              setOpen(false)
            }}
          >
            Kirim Undangan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
