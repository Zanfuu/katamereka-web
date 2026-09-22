import type { RatingDistribution, RatingTrendPoint, Review } from "@/lib/types"

export const reviews: Review[] = [
  {
    id: "r1",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-1",
    reviewerName: "Putri Handayani",
    rating: 5,
    content:
      "Mobilnya bersih, prosesnya cepat, admin fast response. Bakal sewa lagi kalau ke Jakarta.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    reply: {
      content: "Terima kasih Kak Putri! Ditunggu order berikutnya ya 🙏",
      repliedAt: "2026-09-18T10:00:00+07:00",
      repliedBy: "Andi Pratama",
    },
    createdAt: "2026-09-17T14:20:00+07:00",
  },
  {
    id: "r2",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-2",
    reviewerName: "Bagus Setiawan",
    rating: 4,
    content: "Overall bagus, cuma AC mobil kurang dingin waktu perjalanan jauh.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-19T09:05:00+07:00",
  },
  {
    id: "r3",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-3",
    reviewerName: "Nadia Kusuma",
    rating: 2,
    content: "Unit yang dijanjikan tidak tersedia saat pickup, ditukar unit lebih kecil tanpa konfirmasi.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "PENDING_REVIEW",
    reportCount: 0,
    createdAt: "2026-09-20T16:40:00+07:00",
  },
  {
    id: "r4",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-4",
    reviewerName: "Rizky Ramadhan",
    rating: 5,
    content: "Layanan memuaskan, driver antar-jemput on time.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    reply: {
      content: "Terima kasih atas review-nya, Kak Rizky!",
      repliedAt: "2026-09-15T08:00:00+07:00",
      repliedBy: "Andi Pratama",
    },
    createdAt: "2026-09-14T11:15:00+07:00",
  },
  {
    id: "r5",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-5",
    reviewerName: "Melati Sari",
    rating: 1,
    content: "Penipuan! Uang DP tidak dikembalikan padahal saya batalkan sesuai kebijakan.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "UNDER_INVESTIGATION",
    reportCount: 3,
    createdAt: "2026-09-16T13:30:00+07:00",
  },
  {
    id: "r6",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-6",
    reviewerName: "Fikri Aditya",
    rating: 3,
    content: "Standar saja, tidak ada yang spesial tapi tidak mengecewakan juga.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-13T19:50:00+07:00",
  },
  {
    id: "r7",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-7",
    reviewerName: "Salsabila Putri",
    rating: 5,
    content: "Proses booking online gampang banget, unit sesuai foto.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-21T07:10:00+07:00",
  },
  {
    id: "r8",
    businessId: "b1",
    businessName: "TransGO",
    reviewerId: "u-rev-8",
    reviewerName: "Gilang Permana",
    rating: 4,
    content: "Bagus, tapi antrian saat pengembalian mobil cukup lama.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-12T15:00:00+07:00",
  },
  {
    id: "r9",
    businessId: "b2",
    businessName: "Snaplease",
    reviewerId: "u-rev-9",
    reviewerName: "Wulan Ratna",
    rating: 5,
    content: "Unit apartemen bersih dan sesuai deskripsi, host responsif.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-18T12:00:00+07:00",
  },
  {
    id: "r10",
    businessId: "b2",
    businessName: "Snaplease",
    reviewerId: "u-rev-10",
    reviewerName: "Taufik Hidayat",
    rating: 2,
    content: "Foto tidak sesuai kondisi aktual, agak mengecewakan.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "PENDING_REVIEW",
    reportCount: 0,
    createdAt: "2026-09-19T20:00:00+07:00",
  },
  {
    id: "r11",
    businessId: "b3",
    businessName: "Wisata Nusantara",
    reviewerId: "u-rev-11",
    reviewerName: "Intan Permatasari",
    rating: 5,
    content: "Trip terorganisir dengan baik, tour guide ramah dan informatif.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-10T09:00:00+07:00",
  },
  {
    id: "r12",
    businessId: "b6",
    businessName: "Warung Rasa Nusantara",
    reviewerId: "u-rev-12",
    reviewerName: "Yoga Pratama",
    rating: 5,
    content: "Rasa masakan otentik, harga terjangkau, tempat nyaman untuk keluarga.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    createdAt: "2026-09-11T18:30:00+07:00",
  },
  {
    id: "r13",
    businessId: "b7",
    businessName: "BandungMotor Rental",
    reviewerId: "u-rev-13",
    reviewerName: "Rendra Wibowo",
    rating: 1,
    content: "Motor mogok di tengah jalan, tidak ada respons dari CS selama berjam-jam.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "UNDER_INVESTIGATION",
    reportCount: 5,
    createdAt: "2026-09-09T21:15:00+07:00",
  },
  {
    id: "r14",
    businessId: "b7",
    businessName: "BandungMotor Rental",
    reviewerId: "u-rev-14",
    reviewerName: "Anonim",
    rating: 1,
    content: "Akun ini terindikasi review palsu berulang untuk menjatuhkan kompetitor.",
    isVerified: false,
    status: "HIDDEN",
    moderationStatus: "HIDDEN",
    reportCount: 8,
    createdAt: "2026-09-08T05:00:00+07:00",
  },
  {
    id: "r15",
    businessId: "b8",
    businessName: "PropertyHub Indonesia",
    reviewerId: "u-rev-15",
    reviewerName: "Dimas Aryo",
    rating: 1,
    content: "Iklan properti fiktif, sudah bayar booking fee tapi properti tidak ada.",
    isVerified: false,
    status: "REMOVED",
    moderationStatus: "REMOVED",
    reportCount: 12,
    createdAt: "2026-09-05T10:00:00+07:00",
  },
]

export function getReviewsByBusiness(businessId: string) {
  return reviews.filter((review) => review.businessId === businessId)
}

export function getUnansweredReviews(businessId: string) {
  return getReviewsByBusiness(businessId).filter((review) => !review.reply)
}

export function getReportedReviews(businessId: string) {
  return getReviewsByBusiness(businessId).filter((review) => review.reportCount > 0)
}

export function getRatingDistribution(businessId: string): RatingDistribution {
  const businessReviews = getReviewsByBusiness(businessId)
  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of businessReviews) {
    distribution[review.rating] += 1
  }
  return distribution
}

export const ratingTrend7d: RatingTrendPoint[] = [
  { period: "Sen", rating: 4.7 },
  { period: "Sel", rating: 4.75 },
  { period: "Rab", rating: 4.7 },
  { period: "Kam", rating: 4.8 },
  { period: "Jum", rating: 4.78 },
  { period: "Sab", rating: 4.82 },
  { period: "Min", rating: 4.8 },
]

export const ratingTrend30d: RatingTrendPoint[] = [
  { period: "Minggu 1", rating: 4.6 },
  { period: "Minggu 2", rating: 4.65 },
  { period: "Minggu 3", rating: 4.7 },
  { period: "Minggu 4", rating: 4.8 },
]

export const ratingTrend3m: RatingTrendPoint[] = [
  { period: "Jul", rating: 4.5 },
  { period: "Agu", rating: 4.6 },
  { period: "Sep", rating: 4.8 },
]

export const ratingTrend1y: RatingTrendPoint[] = [
  { period: "Okt", rating: 4.3 },
  { period: "Nov", rating: 4.4 },
  { period: "Des", rating: 4.4 },
  { period: "Jan", rating: 4.5 },
  { period: "Feb", rating: 4.5 },
  { period: "Mar", rating: 4.6 },
  { period: "Apr", rating: 4.6 },
  { period: "Mei", rating: 4.7 },
  { period: "Jun", rating: 4.7 },
  { period: "Jul", rating: 4.5 },
  { period: "Agu", rating: 4.6 },
  { period: "Sep", rating: 4.8 },
]

export function getRatingTrend(period: "7d" | "30d" | "3m" | "1y"): RatingTrendPoint[] {
  switch (period) {
    case "7d":
      return ratingTrend7d
    case "30d":
      return ratingTrend30d
    case "3m":
      return ratingTrend3m
    case "1y":
      return ratingTrend1y
  }
}
