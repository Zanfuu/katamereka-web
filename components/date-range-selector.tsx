"use client"

import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PRESETS: { value: string; label: string; days: number | null }[] = [
  { value: "7d", label: "7 Hari Terakhir", days: 7 },
  { value: "30d", label: "30 Hari Terakhir", days: 30 },
  { value: "3m", label: "3 Bulan Terakhir", days: 90 },
  { value: "1y", label: "1 Tahun Terakhir", days: 365 },
  { value: "all", label: "Semua Waktu", days: null },
]

export interface DateRangeValue {
  preset: string
  startDate?: string
  endDate?: string
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function computeRange(preset: (typeof PRESETS)[number]): DateRangeValue {
  if (preset.days === null) return { preset: preset.value }
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - preset.days)
  return { preset: preset.value, startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

/** Uncontrolled by default; pass `onChange` to receive `{startDate, endDate}` for server-side filtering. */
export function DateRangeSelector({
  defaultValue = "30d",
  onChange,
}: {
  defaultValue?: string
  onChange?: (range: DateRangeValue) => void
}) {
  const [value, setValue] = React.useState(defaultValue)
  const active = PRESETS.find((preset) => preset.value === value) ?? PRESETS[1]

  function handleSelect(preset: (typeof PRESETS)[number]) {
    setValue(preset.value)
    onChange?.(computeRange(preset))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          />
        }
      >
        <CalendarIcon className="size-4 text-muted-foreground" />
        {active.label}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PRESETS.map((preset) => (
          <DropdownMenuItem key={preset.value} onClick={() => handleSelect(preset)}>
            {preset.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
