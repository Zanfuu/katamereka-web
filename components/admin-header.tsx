"use client"

import { usePathname } from "next/navigation"

import { BusinessSwitcher } from "@/components/business-switcher"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const titles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/reviews": "Semua Review",
  "/admin/reviews/pending": "Menunggu Balasan",
  "/admin/reviews/reported": "Review Dilaporkan",
  "/admin/reputation": "Rating & Reputasi",
  "/admin/invitations": "Kirim Undangan",
  "/admin/invitations/history": "Riwayat Undangan",
  "/admin/analytics": "Analytics",
  "/admin/business": "Profil Bisnis",
  "/admin/locations": "Lokasi / Cabang",
  "/admin/verification": "Verifikasi Bisnis",
  "/admin/team": "Anggota Tim",
  "/admin/settings": "Pengaturan",
}

export function AdminHeader() {
  const pathname = usePathname()
  const title = titles[pathname] ?? "Business Admin"

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <BusinessSwitcher />
        </div>
      </div>
    </header>
  )
}
