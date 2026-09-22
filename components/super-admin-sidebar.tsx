"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3Icon,
  BuildingIcon,
  ClipboardListIcon,
  FileWarningIcon,
  FlagIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  MailIcon,
  MapPinIcon,
  ScaleIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
  StarIcon,
  TagsIcon,
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
    items: [{ title: "Dashboard", url: "/super-admin", icon: LayoutDashboardIcon }],
  },
  {
    label: "Platform",
    items: [
      { title: "Admin / Customers", url: "/super-admin/customers", icon: UserCogIcon },
      { title: "Businesses", url: "/super-admin/businesses", icon: BuildingIcon },
      { title: "Users", url: "/super-admin/users", icon: UsersIcon },
      { title: "Reviews", url: "/super-admin/reviews", icon: StarIcon },
      { title: "Verifications", url: "/super-admin/verifications", icon: ShieldCheckIcon },
      { title: "Reports & Disputes", url: "/super-admin/reports", icon: ScaleIcon },
    ],
  },
  {
    label: "Moderation",
    items: [
      { title: "Moderation Center", url: "/super-admin/moderation", icon: ShieldAlertIcon },
      { title: "Fraud Detection", url: "/super-admin/fraud", icon: FlagIcon },
      { title: "Evidence Review", url: "/super-admin/evidence", icon: FileWarningIcon },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Categories", url: "/super-admin/categories", icon: TagsIcon },
      { title: "Locations", url: "/super-admin/locations", icon: MapPinIcon },
      { title: "Invitations", url: "/super-admin/invitations", icon: MailIcon },
    ],
  },
  {
    label: "Analytics",
    items: [{ title: "Platform Analytics", url: "/super-admin/analytics", icon: BarChart3Icon }],
  },
  {
    label: "System",
    items: [
      { title: "Audit Logs", url: "/super-admin/audit-logs", icon: ScrollTextIcon },
      { title: "Roles & Permissions", url: "/super-admin/roles", icon: KeyRoundIcon },
      { title: "Email & Notifications", url: "/super-admin/notifications", icon: ClipboardListIcon },
      { title: "API / Integrations", url: "/super-admin/integrations", icon: ShieldIcon },
      { title: "Platform Settings", url: "/super-admin/settings", icon: SettingsIcon },
    ],
  },
]

export function SuperAdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
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
              render={<Link href="/super-admin" />}
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
