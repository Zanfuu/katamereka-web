import * as React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "cn"

export function StatCard({
  label,
  value,
  delta,
  deltaTone = "positive",
  hint,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  delta?: string
  deltaTone?: "positive" | "negative" | "neutral"
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {value}
          </p>
        </div>
        {Icon && (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
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
              {deltaTone === "positive" && <TrendingUpIcon className="size-3.5" />}
              {deltaTone === "negative" && <TrendingDownIcon className="size-3.5" />}
              {delta}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </CardContent>
      )}
    </Card>
  )
}
