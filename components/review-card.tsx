import * as React from "react"
import { BadgeCheckIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RatingStars } from "@/components/rating-stars"
import { StatusBadge } from "@/components/status-badge"
import { formatDate, timeAgo } from "@/lib/format"
import type { Review } from "@/lib/types"

export function ReviewCard({
  review,
  showBusiness = false,
  showModerationStatus = false,
  waitingSince = false,
  actions,
}: {
  review: Review
  showBusiness?: boolean
  showModerationStatus?: boolean
  waitingSince?: boolean
  actions?: React.ReactNode
}) {
  const initials = review.reviewerName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm font-medium text-foreground">
                {review.reviewerName}
              </p>
              {review.isVerified && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-info">
                  <BadgeCheckIcon className="size-3.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <RatingStars rating={review.rating} size="sm" />
              {showBusiness && (
                <span className="text-xs text-muted-foreground">
                  · {review.businessName}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">
            {formatDate(review.createdAt)}
          </span>
          {showModerationStatus && (
            <StatusBadge status={review.moderationStatus} />
          )}
        </div>
      </div>

      <p className="text-sm text-foreground/90">{review.content}</p>

      {waitingSince && !review.reply && (
        <p className="text-xs font-medium text-warning">
          Belum dibalas selama {timeAgo(review.createdAt)}
        </p>
      )}

      {review.reply && (
        <div className="ml-4 flex flex-col gap-1 rounded-lg bg-secondary p-3 sm:ml-11">
          <p className="text-xs font-medium text-foreground">
            Balasan dari {review.reply.repliedBy}
          </p>
          <p className="text-sm text-muted-foreground">{review.reply.content}</p>
        </div>
      )}

      {actions && (
        <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>
      )}
    </div>
  )
}
