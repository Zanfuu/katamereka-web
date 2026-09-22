"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const titles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/customers": "Customers",
  "/admin/businesses": "Businesses",
  "/admin/users": "Users",
  "/admin/reviews": "Reviews",
  "/admin/trust-safety": "Trust & Safety",
  "/admin/master-data": "Master Data",
  "/admin/analytics": "Analytics",
  "/admin/audit-logs": "Audit Logs",
  "/admin/system": "System",
}

export function AdminHeader() {
  const pathname = usePathname()
  const title =
    titles[pathname] ??
    (pathname.startsWith("/admin/businesses/") ? "Business Detail" : "Super Admin")

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
    </header>
  )
}
