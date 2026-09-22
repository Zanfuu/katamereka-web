"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getRatingTrend } from "@/lib/mock/reviews"

const PERIODS = [
  { value: "7d", label: "7 Hari" },
  { value: "30d", label: "30 Hari" },
  { value: "3m", label: "3 Bulan" },
  { value: "1y", label: "1 Tahun" },
] as const

type Period = (typeof PERIODS)[number]["value"]

const chartConfig: ChartConfig = {
  rating: {
    label: "Rating",
    color: "var(--color-primary)",
  },
}

export function RatingTrendChart() {
  const [period, setPeriod] = React.useState<Period>("30d")
  const data = getRatingTrend(period)

  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup
        variant="outline"
        size="sm"
        value={[period]}
        onValueChange={(value) => {
          if (value[0]) setPeriod(value[0] as Period)
        }}
      >
        {PERIODS.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ChartContainer config={chartConfig} className="aspect-auto h-56 w-full">
        <LineChart data={data} margin={{ left: -20, right: 12, top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="period"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            domain={[1, 5]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={28}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Line
            dataKey="rating"
            type="monotone"
            stroke="var(--color-rating)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}
