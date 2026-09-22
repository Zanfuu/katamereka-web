import { businesses } from "@/lib/mock/businesses"
import type { Category } from "@/lib/types"

function businessCount(name: string) {
  return businesses.filter((b) => b.category === name).length
}

export const categories: Category[] = [
  { id: "cat-1", name: "Rental Mobil", businessCount: businessCount("Rental Mobil"), status: "ACTIVE" },
  { id: "cat-2", name: "Rental Motor", businessCount: businessCount("Rental Motor"), status: "ACTIVE" },
  { id: "cat-3", name: "Properti", businessCount: businessCount("Properti"), status: "ACTIVE" },
  { id: "cat-4", name: "Travel", businessCount: businessCount("Travel"), status: "ACTIVE" },
  { id: "cat-5", name: "Hotel", businessCount: businessCount("Hotel"), status: "ACTIVE" },
  { id: "cat-6", name: "Elektronik", businessCount: businessCount("Elektronik"), status: "ACTIVE" },
  {
    id: "cat-7",
    name: "Makanan & Minuman",
    businessCount: businessCount("Makanan & Minuman"),
    status: "ACTIVE",
  },
  { id: "cat-8", name: "Kecantikan & Spa", businessCount: 0, status: "INACTIVE" },
]
