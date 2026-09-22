"use client"

import { CheckIcon, ChevronDownIcon, ListFilterIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface FilterOption {
  label: string
  value: string
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}) {
  const selected = options.find((option) => option.value === value)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
        <ListFilterIcon className="size-3.5" />
        {label}
        {selected && selected.value !== "all" && (
          <span className="text-muted-foreground">: {selected.label}</span>
        )}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem key={option.value} onClick={() => onChange(option.value)}>
            <span className="flex-1">{option.label}</span>
            {option.value === value && <CheckIcon className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
