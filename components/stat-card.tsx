import * as React from "react"
import Link from "next/link"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "cn"

export function StatCard({
  label,
  sublabel,
  value,
  delta,
  deltaTone = "positive",
  hint,
  icon: Icon,
  iconTone = "primary",
  href,
  onClick,
}: {
  label: string
  sublabel?: string
  value: React.ReactNode
  delta?: string
  deltaTone?: "positive" | "negative" | "neutral"
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
  iconTone?: "accent" | "destructive" | "warning" | "primary"
  /** Makes the whole card a link, e.g. jumping to the filtered list it summarizes. */
  href?: string
  onClick?: () => void
}) {
  const direction = delta?.trim().startsWith("-") ? "down" : "up"
  const interactive = Boolean(href || onClick)

  const card = (
    <Card
      className={cn(interactive && "transition-colors hover:border-primary/40 hover:bg-muted/40")}
    >
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          {sublabel && <p className="text-xs text-muted-foreground/80">{sublabel}</p>}
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
        </div>
        {Icon && (
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              iconTone === "accent" && "bg-accent text-accent-foreground",
              iconTone === "destructive" && "bg-destructive/10 text-destructive",
              iconTone === "warning" && "bg-warning/10 text-warning",
              iconTone === "primary" && "bg-primary/10 text-primary"
            )}
          >
            <Icon className="size-4.5" />
          </span>
        )}
      </CardHeader>
      {(delta || hint) && (
        <CardContent className="flex items-center gap-1.5 text-xs">
          {delta && (
            <span
              className={cn(
                "flex items-center gap-0.5 font-medium",
                deltaTone === "positive" && "text-success",
                deltaTone === "negative" && "text-destructive",
                deltaTone === "neutral" && "text-muted-foreground"
              )}
            >
              {direction === "up" ? (
                <TrendingUpIcon className="size-3.5" />
              ) : (
                <TrendingDownIcon className="size-3.5" />
              )}
              {delta}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </CardContent>
      )}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full text-left">
        {card}
      </button>
    )
  }

  return card
}
