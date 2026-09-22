"use client"

import { BuildingIcon, CheckIcon, ChevronRightIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BusinessSwitcher() {
  const { businesses, selectedBusiness, setSelectedBusinessId } = useBusinessContext()

  if (!selectedBusiness) return null

  const card = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <BuildingIcon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">
          {selectedBusiness.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {selectedBusiness.city}, Indonesia
        </span>
      </span>
      {businesses.length > 1 && (
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      )}
    </>
  )

  if (businesses.length <= 1) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
        {card}
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted"
          />
        }
      >
        {card}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => setSelectedBusinessId(business.id)}
          >
            <span className="flex-1">{business.name}</span>
            {business.id === selectedBusiness.id && (
              <CheckIcon className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
