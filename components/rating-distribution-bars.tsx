import { StarIcon } from "lucide-react"

import type { RatingDistribution } from "@/lib/types"
import { formatNumber } from "@/lib/format"

export function RatingDistributionBars({
  distribution,
}: {
  distribution: RatingDistribution
}) {
  const total = distribution[5] + distribution[4] + distribution[3] + distribution[2] + distribution[1]

  return (
    <div className="flex flex-col gap-2.5">
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = distribution[star]
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={star} className="flex items-center gap-2.5 text-sm">
            <span className="flex w-8 shrink-0 items-center gap-0.5 text-muted-foreground">
              {star}
              <StarIcon className="size-3 fill-rating text-rating" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-rating"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
              {formatNumber(count)}
            </span>
          </div>
        )
      })}
    </div>
  )
}
