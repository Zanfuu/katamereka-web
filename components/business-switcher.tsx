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
  const { businesses, selectedBusiness, setSelectedBusinessId, isLoading } = useBusinessContext()

  if (isLoading) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 animate-pulse">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <BuildingIcon className="size-4 opacity-40" />
        </span>
        <span className="min-w-0 flex-1 space-y-1.5">
          <span className="block h-3.5 w-28 rounded bg-muted" />
          <span className="block h-2.5 w-20 rounded bg-muted" />
        </span>
      </div>
    )
  }

  if (!selectedBusiness) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground">
        <BuildingIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">Belum ada bisnis terdaftar</span>
      </div>
    )
  }

  const locationText = selectedBusiness.city
    ? `${selectedBusiness.city}, Indonesia`
    : (selectedBusiness.province || "Indonesia")

  const card = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm uppercase">
        {selectedBusiness.logo ? (
          <img
            src={selectedBusiness.logo}
            alt={selectedBusiness.name}
            className="size-full rounded-lg object-cover"
          />
        ) : (
          <BuildingIcon className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-semibold text-foreground">
          {selectedBusiness.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {locationText}
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
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        {card}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-72 overflow-y-auto">
        {businesses.map((business) => {
          const isSelected = business.id === selectedBusiness.id
          return (
            <DropdownMenuItem
              key={business.id}
              onClick={() => setSelectedBusinessId(business.id)}
              className="flex items-center justify-between gap-2 py-2 cursor-pointer"
            >
              <div className="min-w-0 flex-1">
                <span className="block truncate font-medium text-sm text-foreground">
                  {business.name}
                </span>
                {business.city && (
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {business.city}
                  </span>
                )}
              </div>
              {isSelected && (
                <CheckIcon className="size-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
