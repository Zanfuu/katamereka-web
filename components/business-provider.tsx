"use client"

import * as React from "react"

import { fetchMyBusinesses, type MyBusinessItem } from "@/lib/api-business-dashboard"
import type { Business } from "@/lib/types"

const ACTIVE_BUSINESS_STORAGE_KEY = "katamereka_active_business_id"

export interface BusinessContextValue {
  businesses: Business[]
  selectedBusiness: Business | undefined
  selectedBusinessId: string
  setSelectedBusinessId: (id: string) => void
  isLoading: boolean
  refetch: () => Promise<void>
}

const BusinessContext = React.createContext<BusinessContextValue | null>(null)

function mapMyBusinessToDomain(item: MyBusinessItem): Business {
  const ratingVal = Number(item.averageRating ?? item.rating ?? 0) || 0
  const reviewsVal = Number(item.totalReviews ?? item.reviewCount ?? 0) || 0

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description || "",
    category: item.category || "Bisnis",
    website: item.website || undefined,
    phone: item.phone || undefined,
    email: item.email || undefined,
    logo: item.logo || item.logo_url || undefined,
    cover: item.cover || item.cover_url || undefined,
    address: item.address || "",
    city: item.city || "",
    province: item.province || "",
    postalCode: item.postalCode || item.postal_code || undefined,
    about: item.description || "",
    ownerId: item.id,
    ownerName: item.name,
    averageRating: ratingVal,
    totalReviews: reviewsVal,
    verifiedReviews: reviewsVal,
    responseRate: 100,
    verificationStatus: (item.verificationStatus as any) || (item.is_claimed ? "VERIFIED" : "PENDING"),
    status: (item.status as any) || "ACTIVE",
    createdAt: item.createdAt || new Date().toISOString(),
  }
}

import { API_BASE_URL } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoggedIn } = useAuth()
  const [businesses, setBusinesses] = React.useState<Business[]>([])
  const [selectedBusinessId, setSelectedBusinessIdState] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(true)

  const loadBusinesses = React.useCallback(async () => {
    try {
      setIsLoading(true)
      const list = await fetchMyBusinesses()
      const mapped = list.map(mapMyBusinessToDomain)
      setBusinesses(mapped)

      setSelectedBusinessIdState((prevId) => {
        const stored = typeof window !== "undefined" ? localStorage.getItem(ACTIVE_BUSINESS_STORAGE_KEY) : null
        if (stored && mapped.some((b) => b.id === stored)) {
          return stored
        }
        if (prevId && mapped.some((b) => b.id === prevId)) {
          return prevId
        }
        const fallback = mapped[0]?.id ?? ""
        if (fallback && typeof window !== "undefined") {
          localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, fallback)
        }
        return fallback
      })
    } catch (err) {
      console.warn("Gagal memuat bisnis pengguna:", err)
      setBusinesses([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadBusinesses()
  }, [loadBusinesses, isLoggedIn, user?.id])

  const setSelectedBusinessId = React.useCallback((id: string) => {
    setSelectedBusinessIdState(id)
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_BUSINESS_STORAGE_KEY, id)
    }
  }, [])

  const selectedBusiness = React.useMemo(
    () => businesses.find((b) => b.id === selectedBusinessId) ?? businesses[0],
    [businesses, selectedBusinessId]
  )

  const value = React.useMemo<BusinessContextValue>(
    () => ({
      businesses,
      selectedBusiness,
      selectedBusinessId: selectedBusiness?.id ?? selectedBusinessId,
      setSelectedBusinessId,
      isLoading,
      refetch: loadBusinesses,
    }),
    [businesses, selectedBusiness, selectedBusinessId, setSelectedBusinessId, isLoading, loadBusinesses]
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
