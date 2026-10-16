"use client"

import { BellIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { ProfileSidebar } from "@/components/profile-sidebar"
import { NotificationsSidebar } from "@/components/notifications-sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useAuth } from "@/lib/auth-context"

export function DashboardHeader() {
  const { user } = useAuth()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />

      <div className="ml-auto flex items-center gap-3">
        <NotificationsSidebar />

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
