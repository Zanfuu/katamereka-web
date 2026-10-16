"use client"

import Link from "next/link"
import { BuildingIcon, CheckIcon, ChevronsUpDownIcon, PlusCircleIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
      <Link
        href="/klaim-bisnis"
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground hover:bg-muted/70 transition-colors"
      >
        <BuildingIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate flex-1 font-medium">Belum ada bisnis aktif</span>
        <span className="text-[11px] font-semibold text-primary">+ Klaim</span>
      </Link>
    )
  }

  const locationText = selectedBusiness.city
    ? `${selectedBusiness.city}, Indonesia`
    : (selectedBusiness.province || "Indonesia")

  const triggerCard = (
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
      <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
          />
        }
      >
        {triggerCard}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 max-h-80 overflow-y-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Bisnis Anda ({businesses.length})
          </DropdownMenuLabel>
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
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          render={<Link href="/klaim-bisnis" />}
          className="flex items-center gap-2 py-2 text-primary font-medium text-xs cursor-pointer hover:text-primary"
        >
          <PlusCircleIcon className="size-4 shrink-0" />
          <span>Klaim Bisnis Lainnya</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
