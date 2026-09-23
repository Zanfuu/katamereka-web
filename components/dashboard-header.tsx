"use client"

import { BellIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { ProfileSidebar } from "@/components/profile-sidebar"
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
import { useAuth } from "@/lib/auth-context"
import { timeAgo } from "@/lib/format"
import { businessActivity } from "@/lib/mock/activity"

export function DashboardHeader() {
  const { user } = useAuth()
  const { selectedBusiness } = useBusinessContext()

  const notifications = (selectedBusiness && businessActivity[selectedBusiness.id]) ?? []
  const hasUnread = notifications.length > 0

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="relative flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
            }
          >
            <BellIcon className="size-4.5" />
            {hasUnread && (
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-destructive" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 && (
              <p className="px-1.5 py-3 text-center text-xs text-muted-foreground">
                Belum ada notifikasi baru.
              </p>
            )}
            {notifications.slice(0, 5).map((item) => (
              <DropdownMenuItem key={item.id} className="flex-col items-start gap-0.5">
                <span className="text-xs text-foreground/90">{item.text}</span>
                <span className="text-[11px] text-muted-foreground">{timeAgo(item.at)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <ProfileSidebar
          trigger={
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-muted"
            >
              <Avatar size="sm" className="bg-primary text-primary-foreground">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.initials ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden flex-col items-start leading-none sm:flex">
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
                <span className="text-[11px] text-muted-foreground">Business Admin</span>
              </span>
            </button>
          }
        />
      </div>
    </header>
  )
}
