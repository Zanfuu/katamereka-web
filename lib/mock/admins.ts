import type { AdminStatus, BusinessRole } from "@/lib/types"

// Business Admin accounts (KataMereka's B2B customers) — managed by Super
// Admin under Admin/Customer Management. Distinct from platformUsers, which
// are review-writing end customers.
export interface AdminAccount {
  id: string
  name: string
  email: string
  status: AdminStatus
  joinedAt: string
  lastLoginAt: string
  businesses: { businessId: string; businessName: string; role: BusinessRole }[]
}

export const adminAccounts: AdminAccount[] = [
  {
    id: "u-admin-1",
    name: "Andi Pratama",
    email: "andi@transgo.id",
    status: "ACTIVE",
    joinedAt: "2023-02-10",
    lastLoginAt: "2026-09-21T08:12:00+07:00",
    businesses: [
      { businessId: "b1", businessName: "TransGO", role: "OWNER" },
      { businessId: "b2", businessName: "Snaplease", role: "ADMIN" },
    ],
  },
  {
    id: "u-owner-snaplease",
    name: "Dewi Lestari",
    email: "dewi@snaplease.co.id",
    status: "ACTIVE",
    joinedAt: "2023-06-18",
    lastLoginAt: "2026-09-20T14:22:00+07:00",
    businesses: [{ businessId: "b2", businessName: "Snaplease", role: "OWNER" }],
  },
  {
    id: "u-owner-wisata",
    name: "Budi Santoso",
    email: "budi@wisatanusantara.id",
    status: "ACTIVE",
    joinedAt: "2022-04-21",
    lastLoginAt: "2026-09-19T09:00:00+07:00",
    businesses: [{ businessId: "b3", businessName: "Wisata Nusantara", role: "OWNER" }],
  },
  {
    id: "u-owner-hotelkita",
    name: "Rina Amelia",
    email: "rina@hotelkita.id",
    status: "PENDING",
    joinedAt: "2024-01-09",
    lastLoginAt: "2026-09-17T11:45:00+07:00",
    businesses: [{ businessId: "b4", businessName: "HotelKita Malioboro", role: "OWNER" }],
  },
  {
    id: "u-owner-griya",
    name: "Hendra Wijaya",
    email: "hendra@griyaelektronik.id",
    status: "ACTIVE",
    joinedAt: "2024-08-14",
    lastLoginAt: "2026-09-15T16:10:00+07:00",
    businesses: [{ businessId: "b5", businessName: "Griya Elektronik", role: "OWNER" }],
  },
  {
    id: "u-owner-warung",
    name: "Siti Nurhaliza",
    email: "siti@warungrasa.id",
    status: "ACTIVE",
    joinedAt: "2021-09-30",
    lastLoginAt: "2026-09-21T06:30:00+07:00",
    businesses: [{ businessId: "b6", businessName: "Warung Rasa Nusantara", role: "OWNER" }],
  },
  {
    id: "u-owner-bandungmotor",
    name: "Fajar Ramadhan",
    email: "fajar@bandungmotor.id",
    status: "SUSPENDED",
    joinedAt: "2024-11-02",
    lastLoginAt: "2026-09-08T21:00:00+07:00",
    businesses: [{ businessId: "b7", businessName: "BandungMotor Rental", role: "OWNER" }],
  },
  {
    id: "u-owner-propertyhub",
    name: "Yusuf Maulana",
    email: "yusuf@propertyhub.id",
    status: "SUSPENDED",
    joinedAt: "2023-12-05",
    lastLoginAt: "2026-09-05T09:30:00+07:00",
    businesses: [{ businessId: "b8", businessName: "PropertyHub Indonesia", role: "OWNER" }],
  },
]

export function getAdminById(id: string) {
  return adminAccounts.find((admin) => admin.id === id)
}
