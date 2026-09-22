export interface PlatformGrowthPoint {
  month: string
  users: number
  businesses: number
  reviews: number
}

export const platformGrowth: PlatformGrowthPoint[] = [
  { month: "Apr", users: 4200, businesses: 210, reviews: 8600 },
  { month: "Mei", users: 4650, businesses: 232, reviews: 9800 },
  { month: "Jun", users: 5100, businesses: 258, reviews: 11200 },
  { month: "Jul", users: 5680, businesses: 279, reviews: 12750 },
  { month: "Agu", users: 6220, businesses: 301, reviews: 14300 },
  { month: "Sep", users: 6840, businesses: 328, reviews: 16100 },
]

export interface ReviewActivityPoint {
  day: string
  count: number
}

export const reviewActivity7d: ReviewActivityPoint[] = [
  { day: "Sen", count: 142 },
  { day: "Sel", count: 158 },
  { day: "Rab", count: 131 },
  { day: "Kam", count: 176 },
  { day: "Jum", count: 190 },
  { day: "Sab", count: 164 },
  { day: "Min", count: 148 },
]

export interface ReviewActivityDualPoint {
  day: string
  reviewBaru: number
  reviewDilaporkan: number
}

export const reviewActivity30d: ReviewActivityDualPoint[] = [
  { day: "1 Sep", reviewBaru: 620, reviewDilaporkan: 32 },
  { day: "7 Sep", reviewBaru: 540, reviewDilaporkan: 24 },
  { day: "14 Sep", reviewBaru: 780, reviewDilaporkan: 40 },
  { day: "21 Sep", reviewBaru: 910, reviewDilaporkan: 28 },
  { day: "28 Sep", reviewBaru: 1240, reviewDilaporkan: 45 },
  { day: "30 Sep", reviewBaru: 980, reviewDilaporkan: 30 },
]

export interface DailyCountPoint {
  day: string
  count: number
}

// Daily review volume for the "Jumlah Review" chart on /dashboard/analytics.
export const dailyReviewVolume30d: DailyCountPoint[] = [
  { day: "1 Sep", count: 6 }, { day: "2 Sep", count: 9 }, { day: "3 Sep", count: 8 },
  { day: "4 Sep", count: 11 }, { day: "5 Sep", count: 10 }, { day: "6 Sep", count: 14 },
  { day: "7 Sep", count: 12 }, { day: "8 Sep", count: 15 }, { day: "9 Sep", count: 13 },
  { day: "10 Sep", count: 16 }, { day: "11 Sep", count: 14 }, { day: "12 Sep", count: 18 },
  { day: "13 Sep", count: 17 }, { day: "14 Sep", count: 19 }, { day: "15 Sep", count: 20 },
  { day: "16 Sep", count: 18 }, { day: "17 Sep", count: 22 }, { day: "18 Sep", count: 32 },
  { day: "19 Sep", count: 24 }, { day: "20 Sep", count: 21 }, { day: "21 Sep", count: 23 },
  { day: "22 Sep", count: 25 }, { day: "23 Sep", count: 22 }, { day: "24 Sep", count: 27 },
  { day: "25 Sep", count: 26 }, { day: "26 Sep", count: 29 }, { day: "27 Sep", count: 28 },
  { day: "28 Sep", count: 31 }, { day: "29 Sep", count: 27 }, { day: "30 Sep", count: 30 },
]

export interface ReviewSourceBreakdown {
  label: string
  value: number
  color: string
}

export const reviewSourceBreakdown: ReviewSourceBreakdown[] = [
  { label: "Google", value: 924, color: "var(--color-info)" },
  { label: "Website", value: 231, color: "var(--color-primary)" },
  { label: "WhatsApp", value: 90, color: "#86efac" },
  { label: "Lainnya", value: 39, color: "var(--color-chart-4)" },
]

export const reviewSentimentBreakdown: ReviewSourceBreakdown[] = [
  { label: "Positif", value: 1051, color: "var(--color-primary)" },
  { label: "Netral", value: 154, color: "var(--color-warning)" },
  { label: "Negatif", value: 79, color: "var(--color-destructive)" },
]

export interface KeywordFrequency {
  label: string
  count: number
}

export const topKeywords: KeywordFrequency[] = [
  { label: "pelayanan", count: 412 },
  { label: "mobil bersih", count: 356 },
  { label: "staf ramah", count: 298 },
  { label: "harga terjangkau", count: 221 },
  { label: "proses mudah", count: 189 },
]

export const topKeywordsPositive: KeywordFrequency[] = [
  { label: "fast response", count: 268 },
  { label: "mobil bersih", count: 241 },
  { label: "staf ramah", count: 214 },
  { label: "tepat waktu", count: 176 },
  { label: "worth it", count: 132 },
]

export const topKeywordsNegative: KeywordFrequency[] = [
  { label: "AC kurang dingin", count: 34 },
  { label: "antrian lama", count: 27 },
  { label: "unit tidak sesuai", count: 19 },
  { label: "respon lambat", count: 12 },
  { label: "biaya tambahan", count: 8 },
]
