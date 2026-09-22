import type { PlatformLocation } from "@/lib/types"

// Reference data for province/city — used by business address forms.
// Distinct from a business's own branch locations (see lib/mock/businesses.ts).
export const platformLocations: PlatformLocation[] = [
  { id: "loc-ref-1", province: "DKI Jakarta", city: "Jakarta", status: "ACTIVE" },
  { id: "loc-ref-2", province: "Jawa Barat", city: "Bandung", status: "ACTIVE" },
  { id: "loc-ref-3", province: "DI Yogyakarta", city: "Yogyakarta", status: "ACTIVE" },
  { id: "loc-ref-4", province: "Jawa Timur", city: "Surabaya", status: "ACTIVE" },
  { id: "loc-ref-5", province: "Jawa Tengah", city: "Semarang", status: "ACTIVE" },
  { id: "loc-ref-6", province: "Bali", city: "Denpasar", status: "ACTIVE" },
  { id: "loc-ref-7", province: "Sumatera Utara", city: "Medan", status: "ACTIVE" },
  { id: "loc-ref-8", province: "Sulawesi Selatan", city: "Makassar", status: "INACTIVE" },
]
