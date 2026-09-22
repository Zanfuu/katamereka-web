"use client"

import * as React from "react"

import { businesses } from "@/lib/mock/businesses"
import { currentBusinessAdminMemberships } from "@/lib/mock/session"
import type { Business } from "@/lib/types"

interface BusinessContextValue {
  businesses: Business[]
  selectedBusiness: Business | undefined
  selectedBusinessId: string
  setSelectedBusinessId: (id: string) => void
}

const BusinessContext = React.createContext<BusinessContextValue | null>(null)

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const managedBusinesses = React.useMemo(
    () =>
      businesses.filter((business) =>
        currentBusinessAdminMemberships.some(
          (membership) => membership.businessId === business.id
        )
      ),
    []
  )

  const [selectedBusinessId, setSelectedBusinessId] = React.useState(
    managedBusinesses[0]?.id ?? ""
  )

  const value = React.useMemo<BusinessContextValue>(
    () => ({
      businesses: managedBusinesses,
      selectedBusiness: managedBusinesses.find(
        (business) => business.id === selectedBusinessId
      ),
      selectedBusinessId,
      setSelectedBusinessId,
    }),
    [managedBusinesses, selectedBusinessId]
  )

  return (
    <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
  )
}

export function useBusinessContext() {
  const context = React.useContext(BusinessContext)
  if (!context) {
    throw new Error("useBusinessContext must be used within a BusinessProvider.")
  }
  return context
}
