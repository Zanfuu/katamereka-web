"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { isNavActive } from "@/components/nav-group"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export interface NavSubItem {
  title: string
  url: string
}

export function NavCollapsibleItem({
  title,
  icon: Icon,
  items,
}: {
  title: string
  icon: LucideIcon
  items: NavSubItem[]
}) {
  const pathname = usePathname()
  const isChildActive = items.some((item) => isNavActive(pathname, item.url))

  return (
    <Collapsible defaultOpen={isChildActive}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={<SidebarMenuButton isActive={isChildActive} tooltip={title} />}
        >
          <Icon />
          <span>{title}</span>
          <ChevronRightIcon className="ml-auto size-4 shrink-0 text-muted-foreground transition-transform data-panel-open:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((item) => (
              <SidebarMenuSubItem key={item.url}>
                <SidebarMenuSubButton
                  isActive={pathname === item.url}
                  render={<Link href={item.url} />}
                >
                  <span>{item.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}
