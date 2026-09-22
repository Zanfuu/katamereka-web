"use client"

import * as React from "react"
import { InboxIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { EmptyState } from "@/components/empty-state"
import { PageHeader } from "@/components/page-header"
import { ReplyDialog } from "@/components/reply-dialog"
import { ReviewCard } from "@/components/review-card"
import { getUnansweredReviews } from "@/lib/mock/reviews"

export default function AdminPendingReviewsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [replied, setReplied] = React.useState<string[]>([])

  if (!selectedBusiness) return null

  const queue = getUnansweredReviews(selectedBusiness.id).filter(
    (review) => !replied.includes(review.id)
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menunggu Balasan"
        description="Review yang belum mendapatkan tanggapan dari bisnis kamu."
      />

      <div className="flex flex-col gap-3">
        {queue.length === 0 && (
          <EmptyState
            icon={InboxIcon}
            title="Semua review sudah dibalas."
            description="Kerja bagus! Tidak ada antrean review yang menunggu tanggapan."
          />
        )}
        {queue.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            waitingSince
            actions={
              <ReplyDialog
                review={review}
                triggerLabel="Balas Review"
                onReplied={() => setReplied((prev) => [...prev, review.id])}
              />
            }
          />
        ))}
      </div>
    </div>
  )
}
