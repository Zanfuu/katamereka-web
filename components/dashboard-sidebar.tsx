"use client"

import * as React from "react"
import Link from "next/link"
import {
  ActivityIcon,
  BellIcon,
  BookmarkIcon,
  HistoryIcon,
  LayoutDashboardIcon,
  MessageSquareTextIcon,
  PenLineIcon,
  ShieldIcon,
  StarIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react"

import { NavGroup, type NavItem } from "@/components/nav-group"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navGroups: { label?: string; items: NavItem[] }[] = [
  {
    items: [{ title: "Overview", url: "/dashboard", icon: LayoutDashboardIcon }],
  },
  {
    label: "Reviews Saya",
    items: [
      { title: "Semua Review", url: "/dashboard/reviews", icon: StarIcon },
      { title: "Tulis Review", url: "/dashboard/reviews/create", icon: PenLineIcon },
    ],
  },
  {
    label: "Bisnis",
    items: [
      { title: "Bisnis Tersimpan", url: "/dashboard/businesses/saved", icon: BookmarkIcon },
      { title: "Riwayat Dilihat", url: "/dashboard/businesses/history", icon: HistoryIcon },
    ],
  },
  {
    items: [
      { title: "Aktivitas", url: "/dashboard/activity", icon: ActivityIcon },
      { title: "Notifikasi", url: "/dashboard/notifications", icon: BellIcon },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { title: "Profil", url: "/dashboard/settings/profile", icon: UserIcon },
      { title: "Keamanan", url: "/dashboard/settings/security", icon: ShieldIcon },
      { title: "Hapus Akun", url: "/dashboard/settings/delete-account", icon: Trash2Icon },
    ],
  },
]

const user = {
  name: "Andi",
  email: "andi@example.com",
  avatar: "",
}

export function DashboardSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/dashboard" />}
            >
              <MessageSquareTextIcon className="size-5!" />
              <span className="text-base font-semibold">KataMereka</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group, index) => (
          <NavGroup key={index} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
