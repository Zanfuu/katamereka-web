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
