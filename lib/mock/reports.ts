import type { Report } from "@/lib/types"

export const reports: Report[] = [
  {
    id: "rep1",
    reviewId: "r5",
    reviewExcerpt: "Penipuan! Uang DP tidak dikembalikan padahal saya batalkan sesuai kebijakan.",
    reviewRating: 1,
    businessId: "b1",
    businessName: "TransGO",
    reviewerName: "Melati Sari",
    reporterName: "Andi Pratama",
    reason: "Tuduhan tidak berdasar, kebijakan refund sudah dijelaskan di kontrak sewa.",
    evidence: ["kontrak-sewa-signed.pdf", "chat-refund-policy.png"],
    status: "UNDER_INVESTIGATION",
    moderationStatus: "UNDER_INVESTIGATION",
    createdAt: "2026-09-16T15:00:00+07:00",
  },
  {
    id: "rep2",
    reviewId: "r13",
    reviewExcerpt: "Motor mogok di tengah jalan, tidak ada respons dari CS selama berjam-jam.",
    reviewRating: 1,
    businessId: "b7",
    businessName: "BandungMotor Rental",
    reviewerName: "Rendra Wibowo",
    reporterName: "Fajar Ramadhan",
    reason: "Review dianggap melebih-lebihkan kejadian sebenarnya.",
    status: "OPEN",
    moderationStatus: "PENDING_REVIEW",
    createdAt: "2026-09-09T22:00:00+07:00",
  },
  {
    id: "rep3",
    reviewId: "r14",
    reviewExcerpt: "Akun ini terindikasi review palsu berulang untuk menjatuhkan kompetitor.",
    reviewRating: 1,
    businessId: "b7",
    businessName: "BandungMotor Rental",
    reviewerName: "Anonim",
    reporterName: "Fajar Ramadhan",
    reason: "Review palsu dari kompetitor, pola akun mencurigakan.",
    evidence: ["ip-log-export.csv"],
    status: "RESOLVED",
    moderationStatus: "HIDDEN",
    createdAt: "2026-09-08T06:00:00+07:00",
  },
  {
    id: "rep4",
    reviewId: "r15",
    reviewExcerpt: "Iklan properti fiktif, sudah bayar booking fee tapi properti tidak ada.",
    reviewRating: 1,
    businessId: "b8",
    businessName: "PropertyHub Indonesia",
    reviewerName: "Dimas Aryo",
    reporterName: "Yusuf Maulana",
    reason: "Review tidak sesuai fakta, transaksi tidak pernah terjadi di sistem kami.",
    status: "RESOLVED",
    moderationStatus: "REMOVED",
    createdAt: "2026-09-05T11:00:00+07:00",
  },
]

export function getReportsByStatus(status: Report["status"]) {
  return reports.filter((report) => report.status === status)
}

export function getReportsByBusiness(businessId: string) {
  return reports.filter((report) => report.businessId === businessId)
}
