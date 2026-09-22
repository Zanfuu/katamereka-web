"use client"

import * as React from "react"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const PRESETS: { value: string; label: string; range?: string }[] = [
  { value: "7d", label: "7 Hari Terakhir" },
  { value: "30d", label: "30 Hari Terakhir", range: "1 – 30 September 2026" },
  { value: "3m", label: "3 Bulan Terakhir" },
  { value: "1y", label: "1 Tahun Terakhir" },
]

export function DateRangeSelector() {
  const [value, setValue] = React.useState<(typeof PRESETS)[number]["value"]>("30d")
  const active = PRESETS.find((preset) => preset.value === value) ?? PRESETS[1]

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
        {active.range ?? active.label}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PRESETS.map((preset) => (
          <DropdownMenuItem key={preset.value} onClick={() => setValue(preset.value)}>
            {preset.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
