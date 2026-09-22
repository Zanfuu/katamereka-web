import { DashboardShell } from "@/components/dashboard-shell"
import { SuperAdminHeader } from "@/components/super-admin-header"
import { SuperAdminSidebar } from "@/components/super-admin-sidebar"

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      sidebar={<SuperAdminSidebar variant="inset" />}
      header={<SuperAdminHeader />}
    >
      {children}
    </DashboardShell>
  )
}
