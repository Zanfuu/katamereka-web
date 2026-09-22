import type { FraudFlag } from "@/lib/types"

export const fraudFlags: FraudFlag[] = [
  {
    id: "fr1",
    entityType: "ACCOUNT",
    entityLabel: "Anonim (akun tidak terverifikasi)",
    riskLevel: "HIGH",
    indicators: ["Multiple Accounts", "Suspicious IP", "High Review Velocity"],
    detectedAt: "2026-09-08T06:00:00+07:00",
    status: "INVESTIGATING",
  },
  {
    id: "fr2",
    entityType: "REVIEW",
    entityLabel: "Review #r14 — BandungMotor Rental",
    riskLevel: "HIGH",
    indicators: ["Duplicate Reviews", "Abnormal Rating Pattern"],
    detectedAt: "2026-09-08T06:10:00+07:00",
    status: "OPEN",
  },
  {
    id: "fr3",
    entityType: "ACCOUNT",
    entityLabel: "Rendra Wibowo",
    riskLevel: "MEDIUM",
    indicators: ["High Review Velocity"],
    detectedAt: "2026-09-09T22:00:00+07:00",
    status: "OPEN",
  },
  {
    id: "fr4",
    entityType: "REVIEW",
    entityLabel: "Review #r5 — TransGO Rental",
    riskLevel: "MEDIUM",
    indicators: ["Suspicious IP"],
    detectedAt: "2026-09-16T15:00:00+07:00",
    status: "DISMISSED",
  },
  {
    id: "fr5",
    entityType: "ACCOUNT",
    entityLabel: "Dimas Aryo",
    riskLevel: "LOW",
    indicators: ["Abnormal Rating Pattern"],
    detectedAt: "2026-09-05T11:00:00+07:00",
    status: "DISMISSED",
  },
]

export function getFraudFlagsByStatus(status: FraudFlag["status"]) {
  return fraudFlags.filter((flag) => flag.status === status)
}
