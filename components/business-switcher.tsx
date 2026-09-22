"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function BusinessSwitcher() {
  const { businesses, selectedBusiness, setSelectedBusinessId } = useBusinessContext()

  if (businesses.length <= 1) {
    return selectedBusiness ? (
      <span className="text-sm font-medium text-foreground">
        {selectedBusiness.name}
      </span>
    ) : null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-input px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          />
        }
      >
        {selectedBusiness?.name ?? "Pilih Bisnis"}
        <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {businesses.map((business) => (
          <DropdownMenuItem
            key={business.id}
            onClick={() => setSelectedBusinessId(business.id)}
          >
            <span className="flex-1">{business.name}</span>
            {business.id === selectedBusiness?.id && (
              <CheckIcon className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
