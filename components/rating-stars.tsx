import { StarIcon } from "lucide-react"
import { cn } from "cn"

const SIZE_CLASS = {
  sm: "size-3.5",
  default: "size-4",
  lg: "size-5",
}

export function RatingStars({
  rating,
  size = "default",
  className,
}: {
  rating: number
  size?: keyof typeof SIZE_CLASS
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 5 }).map((_, index) => (
        <StarIcon
          key={index}
          className={cn(
            SIZE_CLASS[size],
            index < Math.round(rating)
              ? "fill-rating text-rating"
              : "text-muted"
          )}
        />
      ))}
    </div>
  )
}
