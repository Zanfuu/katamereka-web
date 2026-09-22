"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3Icon,
  BuildingIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  SendIcon,
  SettingsIcon,
  ShieldCheckIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react"

import { NavItemButton } from "@/components/nav-group"
import { NavCollapsibleItem } from "@/components/nav-collapsible-item"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { currentBusinessAdmin } from "@/lib/mock/session"

export function AdminSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const user = {
    name: currentBusinessAdmin.name,
    email: currentBusinessAdmin.email,
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
              <MessageSquareTextIcon className="size-5!" />
              <span className="text-base font-semibold">KataMereka</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItemButton title="Overview" url="/admin" icon={LayoutDashboardIcon} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reputasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavCollapsibleItem
                title="Reviews"
                icon={StarIcon}
                items={[
                  { title: "Semua Review", url: "/admin/reviews" },
                  { title: "Menunggu Balasan", url: "/admin/reviews/pending" },
                  { title: "Review Dilaporkan", url: "/admin/reviews/reported" },
                ]}
              />
              <NavItemButton
                title="Rating & Reputasi"
                url="/admin/reputation"
                icon={BarChart3Icon}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Customer Engagement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavCollapsibleItem
                title="Undang Review"
                icon={SendIcon}
                items={[
                  { title: "Kirim Undangan", url: "/admin/invitations" },
                  { title: "Riwayat Undangan", url: "/admin/invitations/history" },
                ]}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItemButton title="Analytics" url="/admin/analytics" icon={BarChart3Icon} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Bisnis</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItemButton title="Profil Bisnis" url="/admin/business" icon={BuildingIcon} />
              <NavItemButton title="Lokasi / Cabang" url="/admin/locations" icon={MapPinIcon} />
              <NavItemButton
                title="Verifikasi Bisnis"
                url="/admin/verification"
                icon={ShieldCheckIcon}
              />
              <NavItemButton title="Anggota Tim" url="/admin/team" icon={UsersIcon} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItemButton title="Pengaturan" url="/admin/settings" icon={SettingsIcon} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
