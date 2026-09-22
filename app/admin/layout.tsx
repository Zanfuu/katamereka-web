import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { BusinessProvider } from "@/components/business-provider"
import { DashboardShell } from "@/components/dashboard-shell"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <DashboardShell sidebar={<AdminSidebar variant="inset" />} header={<AdminHeader />}>
        {children}
      </DashboardShell>
    </BusinessProvider>
  )
}
