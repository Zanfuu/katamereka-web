import type { RatingDistribution, RatingTrendPoint, Review } from "@/lib/types"

export const reviews: Review[] = [
  {
    id: "r1",
    businessId: "b1",
    businessName: "TransGO Rental",
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
    source: "Google",
    createdAt: "2026-09-17T14:20:00+07:00",
  },
  {
    id: "r2",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-2",
    reviewerName: "Bagus Setiawan",
    rating: 4,
    content: "Overall bagus, cuma AC mobil kurang dingin waktu perjalanan jauh.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    issue: "Komplain Layanan",
    createdAt: "2026-09-19T09:05:00+07:00",
  },
  {
    id: "r3",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-3",
    reviewerName: "Nadia Kusuma",
    rating: 2,
    content: "Unit yang dijanjikan tidak tersedia saat pickup, ditukar unit lebih kecil tanpa konfirmasi.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "PENDING_REVIEW",
    reportCount: 0,
    issue: "Rating Rendah",
    createdAt: "2026-09-20T16:40:00+07:00",
  },
  {
    id: "r4",
    businessId: "b1",
    businessName: "TransGO Rental",
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
    businessName: "TransGO Rental",
    reviewerId: "u-rev-5",
    reviewerName: "Melati Sari",
    rating: 1,
    content: "Penipuan! Uang DP tidak dikembalikan padahal saya batalkan sesuai kebijakan.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "UNDER_INVESTIGATION",
    reportCount: 3,
    issue: "Rating Rendah",
    createdAt: "2026-09-16T13:30:00+07:00",
  },
  {
    id: "r6",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-6",
    reviewerName: "Fikri Aditya",
    rating: 3,
    content: "Standar saja, tidak ada yang spesial tapi tidak mengecewakan juga.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    issue: "Pertanyaan",
    createdAt: "2026-09-13T19:50:00+07:00",
  },
  {
    id: "r7",
    businessId: "b1",
    businessName: "TransGO Rental",
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
    businessName: "TransGO Rental",
    reviewerId: "u-rev-8",
    reviewerName: "Gilang Permana",
    rating: 4,
    content: "Bagus, tapi antrian saat pengembalian mobil cukup lama.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    issue: "Komplain Layanan",
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
  {
    id: "r16",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-16",
    reviewerName: "Sinta Nuraini",
    rating: 5,
    content:
      "Pelayanan sangat baik, mobil bersih dan tepat waktu. Recommended! Terima kasih TransGO Rental.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    source: "Google",
    photos: ["car-front.jpg", "car-interior.jpg", "car-side.jpg", "car-back.jpg", "car-detail.jpg"],
    reply: {
      content:
        "Terima kasih banyak atas review positifnya, Ibu Sinta! Kami senang Anda puas dengan layanan kami. Sampai jumpa di perjalanan berikutnya 😊",
      repliedAt: "2026-10-01T09:15:00+07:00",
      repliedBy: "Budi Anggara",
    },
    createdAt: "2026-09-30T14:23:00+07:00",
  },
  {
    id: "r17",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-17",
    reviewerName: "Fajar Hidayat",
    rating: 4,
    content: "Proses sewa mudah, staf ramah, mobil dalam kondisi prima.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    source: "Website",
    reply: {
      content: "Terima kasih Kak Fajar, ditunggu order berikutnya!",
      repliedAt: "2026-09-29T08:00:00+07:00",
      repliedBy: "Budi Anggara",
    },
    createdAt: "2026-09-28T10:12:00+07:00",
  },
  {
    id: "r18",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-18",
    reviewerName: "Maya Kartika",
    rating: 5,
    content: "Pengalaman sewa yang menyenangkan. Pasti akan menggunakan lagi!",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    source: "Google",
    createdAt: "2026-09-27T16:45:00+07:00",
  },
  {
    id: "r19",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-19",
    reviewerName: "Dimas Wahyu",
    rating: 3,
    content: "Mobil bagus, tapi ada kendala di bagian AC. Overall masih oke.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    issue: "Komplain Layanan",
    source: "Google",
    createdAt: "2026-09-26T09:18:00+07:00",
  },
  {
    id: "r20",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-20",
    reviewerName: "Rudi Santoso",
    rating: 5,
    content: "Armada terbaru dan pelayanan cepat. Harga juga sesuai.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    source: "Website",
    reply: {
      content: "Terima kasih Kak Rudi atas review-nya!",
      repliedAt: "2026-09-26T07:00:00+07:00",
      repliedBy: "Budi Anggara",
    },
    createdAt: "2026-09-25T21:03:00+07:00",
  },
  {
    id: "r21",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-21",
    reviewerName: "Nabila Azhar",
    rating: 4,
    content: "Proses booking mudah, hanya saja mobil datang sedikit terlambat.",
    isVerified: false,
    status: "PUBLISHED",
    moderationStatus: "PENDING_REVIEW",
    reportCount: 1,
    issue: "Pertanyaan",
    source: "Google",
    createdAt: "2026-09-24T13:27:00+07:00",
  },
  {
    id: "r22",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-22",
    reviewerName: "Agus Firmansyah",
    rating: 3,
    content: "Mobil kurang bersih saat diterima. Harap lebih diperhatikan.",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    issue: "Komplain Layanan",
    source: "Website",
    createdAt: "2026-09-23T11:50:00+07:00",
  },
  {
    id: "r23",
    businessId: "b1",
    businessName: "TransGO Rental",
    reviewerId: "u-rev-23",
    reviewerName: "Lilik Hermawan",
    rating: 5,
    content: "Sangat puas dengan pelayanan dan kondisi mobilnya. Terima kasih!",
    isVerified: true,
    status: "PUBLISHED",
    moderationStatus: "KEPT",
    reportCount: 0,
    source: "Google",
    reply: {
      content: "Sama-sama Kak Lilik, senang bisa membantu!",
      repliedAt: "2026-09-23T09:00:00+07:00",
      repliedBy: "Budi Anggara",
    },
    createdAt: "2026-09-22T18:34:00+07:00",
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

export function getNeedsAttentionReviews(businessId: string) {
  return getReviewsByBusiness(businessId)
    .filter((review) => !review.reply || review.rating <= 2 || review.reportCount > 0)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getRatingDistribution(businessId: string): RatingDistribution {
  const businessReviews = getReviewsByBusiness(businessId)
  const distribution: RatingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const review of businessReviews) {
    distribution[review.rating] += 1
  }
  return distribution
}

/**
 * Rating distribution scaled up to a business's full `totalReviews` count
 * (the sample list above only has a handful of mock rows per business) —
 * used where the UI needs to show a realistic-looking review count, not
 * just the small sample's percentages.
 */
const RATING_DISTRIBUTION_SCALED: Record<string, RatingDistribution> = {
  b1: { 5: 872, 4: 256, 3: 103, 2: 28, 1: 25 },
}

export function getRatingDistributionScaled(businessId: string): RatingDistribution {
  return RATING_DISTRIBUTION_SCALED[businessId] ?? getRatingDistribution(businessId)
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
