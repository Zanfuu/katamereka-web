import type { AuditLogEntry } from "@/lib/types"

export const auditLog: AuditLogEntry[] = [
  {
    id: "al1",
    actorName: "Sarah Wijaya",
    actorRole: "SUPER_ADMIN",
    action: "Removed Review",
    target: "Review #r15 — PropertyHub Indonesia",
    timestamp: "2026-09-05T11:30:00+07:00",
  },
  {
    id: "al2",
    actorName: "Andi Pratama",
    actorRole: "USER",
    action: "Updated Profile",
    target: "TransGO",
    timestamp: "2026-09-17T08:00:00+07:00",
  },
  {
    id: "al3",
    actorName: "Sarah Wijaya",
    actorRole: "SUPER_ADMIN",
    action: "Approved Verification",
    target: "TransGO",
    timestamp: "2022-11-14T15:00:00+07:00",
  },
  {
    id: "al4",
    actorName: "Sarah Wijaya",
    actorRole: "SUPER_ADMIN",
    action: "Hidden Review",
    target: "Review #r14 — BandungMotor Rental",
    timestamp: "2026-09-08T06:10:00+07:00",
  },
  {
    id: "al5",
    actorName: "Sarah Wijaya",
    actorRole: "SUPER_ADMIN",
    action: "Rejected Verification",
    target: "BandungMotor Rental",
    timestamp: "2024-11-15T10:00:00+07:00",
  },
]

export function getAuditLogByTarget(target: string) {
  return auditLog.filter((entry) => entry.target.includes(target))
}
