import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// Single source of truth for status color mapping (spec AU) — every status
// badge in either dashboard should render through this component so colors
// stay consistent across pages instead of being picked ad hoc.
const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        green: "bg-success/10 text-success",
        amber: "bg-warning/10 text-warning",
        red: "bg-destructive/10 text-destructive",
        gray: "bg-muted text-muted-foreground",
        blue: "bg-info/10 text-info",
      },
    },
    defaultVariants: {
      tone: "gray",
    },
  }
)

const STATUS_TONE: Record<string, VariantProps<typeof statusBadgeVariants>["tone"]> = {
  // green
  ACTIVE: "green",
  VERIFIED: "green",
  PUBLISHED: "green",
  APPROVED: "green",
  KEPT: "green",
  COMPLETED: "green",
  RESOLVED: "green",
  // amber
  PENDING: "amber",
  PENDING_REVIEW: "amber",
  UNDER_INVESTIGATION: "amber",
  OPEN: "amber",
  SENT: "amber",
  OPENED: "amber",
  // red
  BANNED: "red",
  SUSPENDED: "red",
  REJECTED: "red",
  REMOVED: "red",
  HIGH: "red",
  // gray
  INACTIVE: "gray",
  UNVERIFIED: "gray",
  HIDDEN: "gray",
  EXPIRED: "gray",
  MEMBER: "gray",
  // blue
  IN_PROGRESS: "blue",
  INFORMATIONAL: "blue",
  MEDIUM: "blue",
  ADMIN: "blue",
  OWNER: "blue",
}

const STATUS_LABEL: Record<string, string> = {
  PENDING_REVIEW: "Pending Review",
  UNDER_INVESTIGATION: "Under Investigation",
  IN_PROGRESS: "In Progress",
}

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string
  label?: string
  className?: string
}) {
  const tone = STATUS_TONE[status] ?? "gray"
  const text = label ?? STATUS_LABEL[status] ?? toTitleCase(status)

  return (
    <span className={cn(statusBadgeVariants({ tone }), className)}>{text}</span>
  )
}

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
