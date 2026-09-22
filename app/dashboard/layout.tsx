import { BusinessProvider } from "@/components/business-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <DashboardShell
        sidebar={<DashboardSidebar variant="inset" />}
        header={<DashboardHeader />}
      >
        {children}
      </DashboardShell>
    </BusinessProvider>
  )
}
