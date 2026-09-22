"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const titles: Record<string, string> = {
  "/super-admin": "Dashboard",
  "/super-admin/customers": "Admin / Customer Management",
  "/super-admin/businesses": "Business Management",
  "/super-admin/users": "User Management",
  "/super-admin/reviews": "Global Review Management",
  "/super-admin/verifications": "Verification Management",
  "/super-admin/reports": "Reports & Disputes",
  "/super-admin/moderation": "Moderation Center",
  "/super-admin/fraud": "Fraud Detection",
  "/super-admin/evidence": "Evidence Review",
  "/super-admin/categories": "Categories",
  "/super-admin/locations": "Locations",
  "/super-admin/invitations": "Invitations",
  "/super-admin/analytics": "Platform Analytics",
  "/super-admin/audit-logs": "Audit Logs",
  "/super-admin/roles": "Roles & Permissions",
  "/super-admin/notifications": "Email & Notifications",
  "/super-admin/integrations": "API / Integrations",
  "/super-admin/settings": "Platform Settings",
}

export function SuperAdminHeader() {
  const pathname = usePathname()
  const title =
    titles[pathname] ??
    (pathname.startsWith("/super-admin/businesses/") ? "Business Detail" : "Super Admin")

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
