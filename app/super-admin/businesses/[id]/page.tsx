import { BadgeCheckIcon, MessageSquareTextIcon, ShieldCheckIcon, StarIcon } from "lucide-react"

import { RatingDistributionBars } from "@/components/rating-distribution-bars"
import { ReviewCard } from "@/components/review-card"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBusinessById } from "@/lib/mock/businesses"
import { getRatingDistribution, getReviewsByBusiness } from "@/lib/mock/reviews"

export default async function BusinessDetailOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const business = getBusinessById(id)
  if (!business) return null

  const reviews = getReviewsByBusiness(id)
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
  const verifiedPct =
    business.totalReviews > 0
      ? Math.round((business.verifiedReviews / business.totalReviews) * 100)
      : 0

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
        <StatCard
          label="Response Rate"
          value={`${business.responseRate}%`}
          icon={ShieldCheckIcon}
        />
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
            <CardTitle>Review Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentReviews.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Belum ada review untuk bisnis ini.
              </p>
            )}
            {recentReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
