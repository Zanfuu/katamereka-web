"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3Icon,
  BuildingIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  StarIcon,
  TrophyIcon,
} from "lucide-react"

import { BusinessSwitcher } from "@/components/business-switcher"
import { NavGroup } from "@/components/nav-group"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const navGroups = [
  {
    label: "Overview",
    items: [{ title: "Overview", url: "/dashboard", icon: LayoutDashboardIcon }],
  },
  {
    label: "Reputasi",
    items: [
      { title: "Reviews", url: "/dashboard/reviews", icon: StarIcon },
      { title: "Invitations", url: "/dashboard/invitations", icon: SendIcon },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3Icon },
    ],
  },
  {
    label: "Bisnis",
    items: [{ title: "Business", url: "/dashboard/business", icon: BuildingIcon }],
  },
  {
    label: "System",
    items: [{ title: "Settings", url: "/dashboard/settings", icon: SettingsIcon }],
  },
]

export function DashboardSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [query, setQuery] = React.useState("")

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.title.toLowerCase().includes(query.trim().toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="gap-3 px-3 pt-3">
        <Link href="/dashboard" className="flex items-center gap-2 px-1">
          <MessageSquareTextIcon className="size-5 text-primary" />
          <span className="flex flex-col leading-none">
            <span className="text-base font-semibold text-foreground">KataMereka</span>
            <span className="text-[11px] text-muted-foreground">Suara Pelanggan, Nilai Nyata</span>
          </span>
        </Link>
        <BusinessSwitcher />
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari menu..."
            className="h-9 w-full rounded-lg bg-secondary pl-8 text-sm"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {filteredGroups.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted-foreground">
            Menu &ldquo;{query}&rdquo; tidak ditemukan.
          </p>
        ) : (
          filteredGroups.map((group) => (
            <NavGroup key={group.label} label={group.label} items={group.items} />
          ))
        )}
      </SidebarContent>
      <SidebarFooter className="p-3">
        <div className="flex flex-col gap-2 rounded-xl bg-accent p-4">
          <TrophyIcon className="size-5 text-accent-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Tingkatkan Reputasi Bisnis Anda
          </p>
          <p className="text-xs text-muted-foreground">
            Undang lebih banyak pelanggan untuk memberikan review.
          </p>
          <Button size="sm" className="mt-1" render={<Link href="/dashboard/invitations" />}>
            Undang Sekarang
            <SendIcon />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
