"use client"

import { usePathname } from "next/navigation"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const titles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/reviews": "Semua Review",
  "/dashboard/reviews/create": "Tulis Review",
  "/dashboard/businesses/saved": "Bisnis Tersimpan",
  "/dashboard/businesses/history": "Riwayat Dilihat",
  "/dashboard/activity": "Aktivitas",
  "/dashboard/notifications": "Notifikasi",
  "/dashboard/settings/profile": "Profil",
  "/dashboard/settings/security": "Keamanan",
  "/dashboard/settings/delete-account": "Hapus Akun",
}

export function DashboardHeader() {
  const pathname = usePathname()
  const title = titles[pathname] ?? "Dashboard"

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
