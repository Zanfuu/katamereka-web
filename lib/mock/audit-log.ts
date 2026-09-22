import type { AuditLogEntry } from "@/lib/types"

export const auditLog: AuditLogEntry[] = [
  {
    id: "al1",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Removed Review",
    target: "Review #r15 — PropertyHub Indonesia",
    timestamp: "2026-09-05T11:30:00+07:00",
    ip: "36.72.14.201",
  },
  {
    id: "al2",
    actorName: "Andi Pratama",
    actorRole: "USER",
    action: "Updated Profile",
    target: "TransGO Rental",
    timestamp: "2026-09-17T08:00:00+07:00",
    ip: "114.79.22.5",
  },
  {
    id: "al3",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Approved Verification",
    target: "TransGO Rental",
    timestamp: "2022-11-14T15:00:00+07:00",
    ip: "36.72.14.201",
  },
  {
    id: "al4",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Hidden Review",
    target: "Review #r14 — BandungMotor Rental",
    timestamp: "2026-09-08T06:10:00+07:00",
    ip: "36.72.14.201",
  },
  {
    id: "al5",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Rejected Verification",
    target: "BandungMotor Rental",
    timestamp: "2024-11-15T10:00:00+07:00",
    ip: "36.72.14.201",
  },
  {
    id: "al6",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Suspended Business",
    target: "PropertyHub Indonesia",
    timestamp: "2026-09-05T11:35:00+07:00",
    ip: "36.72.14.201",
  },
  {
    id: "al7",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Banned User",
    target: "Akun Tidak Dikenal",
    timestamp: "2026-09-08T05:30:00+07:00",
    ip: "36.72.14.201",
  },
  {
    id: "al8",
    actorName: "Billyaz",
    actorRole: "SUPER_ADMIN",
    action: "Changed Permission",
    target: "Fajar Ramadhan — BandungMotor Rental",
    timestamp: "2026-09-08T21:10:00+07:00",
    ip: "36.72.14.201",
  },
]

export function getAuditLogByTarget(target: string) {
  return auditLog.filter((entry) => entry.target.includes(target))
}
