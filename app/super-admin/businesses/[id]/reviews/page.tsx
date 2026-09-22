"use client"

import * as React from "react"
import { use } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"
import { ReplyDialog } from "@/components/reply-dialog"
import { ReviewCard } from "@/components/review-card"
import { Button } from "@/components/ui/button"
import { getReviewsByBusiness } from "@/lib/mock/reviews"
import type { Review } from "@/lib/types"
import { MessageSquareTextIcon } from "lucide-react"

export default function BusinessDetailReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [action, setAction] = React.useState<{ review: Review; type: "HIDE" | "REMOVE" } | null>(
    null
  )

  const reviews = getReviewsByBusiness(id)

  return (
    <div className="flex flex-col gap-3">
      {reviews.length === 0 && (
        <EmptyState
          icon={MessageSquareTextIcon}
          title="Belum ada review untuk bisnis ini."
        />
      )}
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          showModerationStatus
          actions={
            <>
              {!review.reply && <ReplyDialog review={review} triggerVariant="outline" />}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAction({ review, type: "HIDE" })}
              >
                Hide
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setAction({ review, type: "REMOVE" })}
              >
                Remove
              </Button>
            </>
          }
        />
      ))}

      <ConfirmDialog
        open={!!action}
        onOpenChange={(open) => !open && setAction(null)}
        title={
          action?.type === "HIDE"
            ? `Sembunyikan review dari ${action.review.reviewerName}?`
            : `Hapus review dari ${action?.review.reviewerName}?`
        }
        description="Tindakan moderasi ini akan tercatat di audit log platform."
        confirmLabel={action?.type === "HIDE" ? "Hide Review" : "Remove Review"}
        variant="destructive"
        requireReason
        reasonLabel="Alasan moderasi"
        onConfirm={() =>
          toast.success(
            action?.type === "HIDE" ? "Review berhasil disembunyikan." : "Review berhasil dihapus."
          )
        }
      />
    </div>
  )
}
