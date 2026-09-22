import { ScrollTextIcon } from "lucide-react"

import { EmptyState } from "@/components/empty-state"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDateTime } from "@/lib/format"
import { getAuditLogByTarget } from "@/lib/mock/audit-log"
import { getBusinessById } from "@/lib/mock/businesses"
import { getVerificationByBusiness } from "@/lib/mock/verifications"

export default async function BusinessDetailActivityPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const business = getBusinessById(id)
  if (!business) return null

  const auditEntries = getAuditLogByTarget(business.name)
  const verification = getVerificationByBusiness(id)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {auditEntries.length === 0 ? (
            <EmptyState icon={ScrollTextIcon} title="Belum ada aktivitas audit untuk bisnis ini." />
          ) : (
            auditEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-foreground">{entry.action}</p>
                  <p className="text-xs text-muted-foreground">oleh {entry.actorName}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(entry.timestamp)}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {verification && (
        <Card>
          <CardHeader>
            <CardTitle>Verification History</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {verification.history.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StatusBadge status={entry.status} />
                  <span className="text-foreground/90">{entry.note}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
