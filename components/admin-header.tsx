"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { BellIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { currentSuperAdmin } from "@/lib/mock/session"

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
}

export function AdminHeader() {
  const router = useRouter()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <BellIcon className="size-4.5" />
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
              />
            }
          >
            <Avatar size="sm" className="bg-primary text-primary-foreground">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials(currentSuperAdmin.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden flex-col items-start leading-none sm:flex">
              <span className="text-sm font-medium text-foreground">{currentSuperAdmin.name}</span>
              <span className="text-[11px] text-muted-foreground">Super Admin</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{currentSuperAdmin.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/admin/system" />}>
              <UserIcon />
              Profil Saya
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/admin/system" />}>
              <SettingsIcon />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => router.push("/login")}>
              <LogOutIcon />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
