"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3Icon,
  BuildingIcon,
  DatabaseIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldIcon,
  ShieldAlertIcon,
  StarIcon,
  UserCogIcon,
  UsersIcon,
} from "lucide-react"

import { NavGroup } from "@/components/nav-group"
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
import { currentSuperAdmin } from "@/lib/mock/session"

const navGroups = [
  {
    items: [{ title: "Overview", url: "/admin", icon: LayoutDashboardIcon }],
  },
  {
    label: "Platform",
    items: [
      { title: "Customers", url: "/admin/customers", icon: UserCogIcon },
      { title: "Businesses", url: "/admin/businesses", icon: BuildingIcon },
      { title: "Users", url: "/admin/users", icon: UsersIcon },
      { title: "Reviews", url: "/admin/reviews", icon: StarIcon },
    ],
  },
  {
    label: "Trust & Safety",
    items: [{ title: "Trust & Safety", url: "/admin/trust-safety", icon: ShieldAlertIcon }],
  },
  {
    label: "Management",
    items: [
      { title: "Master Data", url: "/admin/master-data", icon: DatabaseIcon },
      { title: "Analytics", url: "/admin/analytics", icon: BarChart3Icon },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollTextIcon },
      { title: "System", url: "/admin/system", icon: SettingsIcon },
    ],
  },
]

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: currentSuperAdmin.name,
    email: currentSuperAdmin.email,
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href="/admin" />}
            >
              <ShieldIcon className="size-5!" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-semibold">KataMereka</span>
                <span className="text-[11px] font-medium text-muted-foreground">
                  Super Admin
                </span>
              </div>
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
