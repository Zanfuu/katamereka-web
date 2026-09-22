"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RatingStars } from "@/components/rating-stars"
import { Textarea } from "@/components/ui/textarea"
import type { Review } from "@/lib/types"
import type { VariantProps } from "class-variance-authority"

export function ReplyDialog({
  review,
  triggerLabel = "Balas",
  triggerVariant = "default",
  triggerSize = "sm",
  onReplied,
}: {
  review: Review
  triggerLabel?: string
  triggerVariant?: VariantProps<typeof buttonVariants>["variant"]
  triggerSize?: VariantProps<typeof buttonVariants>["size"]
  onReplied?: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const [reply, setReply] = React.useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={triggerVariant} size={triggerSize} />}>
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Balas review {review.reviewerName}</DialogTitle>
        </DialogHeader>
        <RatingStars rating={review.rating} size="sm" />
        <p className="rounded-lg bg-secondary p-3 text-sm text-foreground/90">
          {review.content}
        </p>
        <Textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Tulis balasan untuk customer..."
          rows={4}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={reply.trim().length === 0}
            onClick={() => {
              toast.success("Balasan berhasil dikirim.")
              setReply("")
              setOpen(false)
              onReplied?.()
            }}
          >
            Kirim Balasan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
