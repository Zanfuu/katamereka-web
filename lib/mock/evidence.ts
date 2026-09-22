import type { Evidence } from "@/lib/types"

// Evidence attached to reported reviews (receipts, chat logs, photos) —
// private by default, only visible to Super Admin during a dispute.
export const evidenceSubmissions: Evidence[] = [
  {
    id: "ev1",
    reviewId: "r5",
    reviewExcerpt: "Penipuan! Uang DP tidak dikembalikan padahal saya batalkan sesuai kebijakan.",
    userName: "Andi Pratama",
    businessName: "TransGO Rental",
    type: "OTHER",
    submittedAt: "2026-09-16T15:30:00+07:00",
    status: "PENDING",
  },
  {
    id: "ev2",
    reviewId: "r5",
    reviewExcerpt: "Penipuan! Uang DP tidak dikembalikan padahal saya batalkan sesuai kebijakan.",
    userName: "Andi Pratama",
    businessName: "TransGO Rental",
    type: "CHAT_LOG",
    submittedAt: "2026-09-16T15:31:00+07:00",
    status: "PENDING",
  },
  {
    id: "ev3",
    reviewId: "r14",
    reviewExcerpt: "Akun ini terindikasi review palsu berulang untuk menjatuhkan kompetitor.",
    userName: "Fajar Ramadhan",
    businessName: "BandungMotor Rental",
    type: "OTHER",
    submittedAt: "2026-09-08T06:05:00+07:00",
    status: "VERIFIED",
  },
  {
    id: "ev4",
    reviewId: "r15",
    reviewExcerpt: "Iklan properti fiktif, sudah bayar booking fee tapi properti tidak ada.",
    userName: "Yusuf Maulana",
    businessName: "PropertyHub Indonesia",
    type: "RECEIPT",
    submittedAt: "2026-09-05T11:15:00+07:00",
    status: "REJECTED",
  },
]

export function getEvidenceByReview(reviewId: string) {
  return evidenceSubmissions.filter((item) => item.reviewId === reviewId)
}
