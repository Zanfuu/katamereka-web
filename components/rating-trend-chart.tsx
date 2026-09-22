"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getRatingTrend } from "@/lib/mock/reviews"

const PERIODS = [
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "30d", label: "30 Hari Terakhir" },
  { value: "3m", label: "3 Bulan Terakhir" },
  { value: "1y", label: "1 Tahun Terakhir" },
] as const

type Period = (typeof PERIODS)[number]["value"]

const chartConfig: ChartConfig = {
  rating: {
    label: "Rating",
    color: "var(--color-rating)",
  },
}

export function RatingTrendChart({ showHeader = true }: { showHeader?: boolean }) {
  const [period, setPeriod] = React.useState<Period>("30d")
  const data = getRatingTrend(period)

  return (
    <div className="flex flex-col gap-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Perkembangan rating dari waktu ke waktu</span>
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
        <AreaChart data={data} margin={{ left: -20, right: 12, top: 8 }}>
          <defs>
            <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            domain={[1, 5]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={28}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Area
            dataKey="rating"
            type="monotone"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#ratingFill)"
            dot={{ r: 3, fill: "var(--color-primary)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
