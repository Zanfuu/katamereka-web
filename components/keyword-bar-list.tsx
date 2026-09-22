import { formatNumber } from "@/lib/format"

export function KeywordBarList({
  items,
}: {
  items: { label: string; count: number }[]
}) {
  const max = Math.max(...items.map((item) => item.count), 1)

  return (
    <div className="flex flex-col gap-2.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5 text-sm">
          <span className="w-32 shrink-0 truncate text-muted-foreground">{item.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.round((item.count / max) * 100)}%` }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">
            {formatNumber(item.count)}
          </span>
        </div>
      ))}
    </div>
  )
}
