import type { User } from "@/lib/types"

// Platform users — people who write reviews on KataMereka (end customers),
// managed by Super Admin under User Management. Distinct from Business Admin
// accounts, see lib/mock/admins.ts.
export const platformUsers: User[] = [
  { id: "u-rev-1", name: "Putri Handayani", email: "putri.h@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 14, joinedAt: "2023-03-02", lastActiveAt: "2026-09-20T10:00:00+07:00" },
  { id: "u-rev-2", name: "Bagus Setiawan", email: "bagus.setiawan@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 6, joinedAt: "2023-07-19", lastActiveAt: "2026-09-19T08:30:00+07:00" },
  { id: "u-rev-3", name: "Nadia Kusuma", email: "nadia.kusuma@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 9, joinedAt: "2024-01-11", lastActiveAt: "2026-09-20T16:40:00+07:00" },
  { id: "u-rev-4", name: "Rizky Ramadhan", email: "rizky.ramadhan@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 22, joinedAt: "2022-09-05", lastActiveAt: "2026-09-14T11:15:00+07:00" },
  { id: "u-rev-5", name: "Melati Sari", email: "melati.sari99@gmail.com", platformRole: "USER", status: "SUSPENDED", reviewCount: 3, joinedAt: "2025-04-22", lastActiveAt: "2026-09-16T13:30:00+07:00" },
  { id: "u-rev-6", name: "Fikri Aditya", email: "fikri.aditya@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 11, joinedAt: "2023-11-30", lastActiveAt: "2026-09-13T19:50:00+07:00" },
  { id: "u-rev-7", name: "Salsabila Putri", email: "salsabila.putri@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 5, joinedAt: "2024-06-08", lastActiveAt: "2026-09-21T07:10:00+07:00" },
  { id: "u-rev-8", name: "Gilang Permana", email: "gilang.permana@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 17, joinedAt: "2022-12-15", lastActiveAt: "2026-09-12T15:00:00+07:00" },
  { id: "u-rev-9", name: "Wulan Ratna", email: "wulan.ratna@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 8, joinedAt: "2024-02-27", lastActiveAt: "2026-09-18T12:00:00+07:00" },
  { id: "u-rev-10", name: "Taufik Hidayat", email: "taufik.hidayat@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 4, joinedAt: "2025-01-19", lastActiveAt: "2026-09-19T20:00:00+07:00" },
  { id: "u-rev-11", name: "Intan Permatasari", email: "intan.permatasari@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 27, joinedAt: "2022-05-14", lastActiveAt: "2026-09-10T09:00:00+07:00" },
  { id: "u-rev-12", name: "Yoga Pratama", email: "yoga.pratama@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 13, joinedAt: "2023-08-23", lastActiveAt: "2026-09-11T18:30:00+07:00" },
  { id: "u-rev-13", name: "Rendra Wibowo", email: "rendra.wibowo@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 2, joinedAt: "2025-09-01", lastActiveAt: "2026-09-09T21:15:00+07:00" },
  { id: "u-rev-14", name: "Akun Tidak Dikenal", email: "unknown0142@mailinator.com", platformRole: "USER", status: "BANNED", reviewCount: 31, joinedAt: "2026-01-04", lastActiveAt: "2026-09-08T05:00:00+07:00" },
  { id: "u-rev-15", name: "Dimas Aryo", email: "dimas.aryo@gmail.com", platformRole: "USER", status: "ACTIVE", reviewCount: 1, joinedAt: "2026-08-30", lastActiveAt: "2026-09-05T10:00:00+07:00" },
]

export function getUserById(id: string) {
  return platformUsers.find((user) => user.id === id)
}
