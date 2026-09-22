"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export function isNavActive(pathname: string, url: string) {
  const segments = url.split("/").filter(Boolean)
  if (segments.length <= 1) return pathname === url
  return pathname === url || pathname.startsWith(`${url}/`)
}

export function NavItemButton({ title, url, icon: Icon }: NavItem) {
  const pathname = usePathname()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={title}
        isActive={isNavActive(pathname, url)}
        render={<Link href={url} />}
      >
        <Icon />
        <span>{title}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavGroup({
  label,
  items,
}: {
  label?: string
  items: NavItem[]
}) {
  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavItemButton key={item.url} {...item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
