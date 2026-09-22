"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  variant = "default",
  requireReason = false,
  reasonLabel = "Alasan",
  reasonPlaceholder = "Jelaskan alasan tindakan ini...",
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
  requireReason?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  onConfirm: (reason?: string) => void
}) {
  const reasonRef = React.useRef<HTMLTextAreaElement>(null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {requireReason && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-dialog-reason">{reasonLabel}</Label>
            <Textarea
              id="confirm-dialog-reason"
              ref={reasonRef}
              placeholder={reasonPlaceholder}
              rows={3}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            onClick={() => {
              const reason = requireReason ? (reasonRef.current?.value.trim() ?? "") : undefined
              if (requireReason && !reason) {
                toast.error(`${reasonLabel} wajib diisi.`)
                return
              }
              onConfirm(reason)
              onOpenChange(false)
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
