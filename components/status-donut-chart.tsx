"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

import { formatNumber } from "@/lib/format"

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export function StatusDonutChart({
  segments,
  centerValue,
  centerLabel,
  showCount = false,
}: {
  segments: DonutSegment[]
  centerValue: string
  centerLabel: string
  /** Show the raw segment value in parens next to its percentage, e.g. "72% (924)". */
  showCount?: boolean
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="label"
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {segments.map((segment) => (
                <Cell key={segment.label} fill={segment.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-foreground">{centerValue}</span>
          <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2.5">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-foreground/90">{segment.label}</span>
            </span>
            <span className="text-muted-foreground">
              {total > 0 ? Math.round((segment.value / total) * 100) : 0}%
              {showCount && ` (${formatNumber(segment.value)})`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
