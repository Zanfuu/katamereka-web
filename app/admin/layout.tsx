import { DashboardShell } from "@/components/dashboard-shell"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      sidebar={<AdminSidebar variant="inset" />}
      header={<AdminHeader />}
    >
      {children}
    </DashboardShell>
  )
}
