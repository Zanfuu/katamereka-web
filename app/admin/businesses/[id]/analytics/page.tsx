import { BadgeCheckIcon, MessageSquareTextIcon, ShieldCheckIcon, StarIcon } from "lucide-react"

import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBusinessById } from "@/lib/mock/businesses"
import { getRatingDistribution, getReviewsByBusiness } from "@/lib/mock/reviews"

export default async function BusinessDetailAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const business = getBusinessById(id)
  if (!business) return null

  const reviews = getReviewsByBusiness(id)
  const verifiedPct =
    business.totalReviews > 0
      ? Math.round((business.verifiedReviews / business.totalReviews) * 100)
      : 0

  const byMonth = new Map<string, number>()
  reviews.forEach((review) => {
    const month = review.createdAt.slice(0, 7)
    byMonth.set(month, (byMonth.get(month) ?? 0) + 1)
  })
  const volume = Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }))

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Average Rating" value={business.averageRating.toFixed(1)} icon={StarIcon} />
        <StatCard
          label="Total Reviews"
          value={business.totalReviews.toLocaleString("id-ID")}
          icon={MessageSquareTextIcon}
        />
        <StatCard label="Verified Reviews" value={`${verifiedPct}%`} icon={BadgeCheckIcon} />
        <StatCard label="Response Rate" value={`${business.responseRate}%`} icon={ShieldCheckIcon} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistributionBars distribution={getRatingDistribution(id)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Volume</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {volume.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data review untuk ditampilkan.
              </p>
            )}
            {volume.map((point) => (
              <div key={point.month} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-muted-foreground">{point.month}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, (point.count / Math.max(...volume.map((v) => v.count))) * 100)}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-muted-foreground">{point.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
