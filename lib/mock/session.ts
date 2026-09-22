import type { BusinessMember, User } from "@/lib/types"

// The currently "logged in" Business Admin — member of two businesses so the
// business switcher has a real reason to render. Frontend-only mock: a real
// implementation reads this from the authenticated session on the server.
export const currentBusinessAdmin: User = {
  id: "u-admin-1",
  name: "Andi Pratama",
  email: "andi@transgo.id",
  platformRole: "USER",
  status: "ACTIVE",
  reviewCount: 0,
  joinedAt: "2023-02-10",
  lastActiveAt: "2026-09-21T08:12:00+07:00",
}

export const currentBusinessAdminMemberships: BusinessMember[] = [
  {
    id: "bm-session-1",
    businessId: "b1",
    userId: "u-admin-1",
    name: "Andi Pratama",
    email: "andi@transgo.id",
    role: "OWNER",
    status: "ACTIVE",
    joinedAt: "2023-02-10",
  },
  {
    id: "bm-session-2",
    businessId: "b2",
    userId: "u-admin-1",
    name: "Andi Pratama",
    email: "andi@transgo.id",
    role: "ADMIN",
    status: "ACTIVE",
    joinedAt: "2024-05-02",
  },
]

// The currently "logged in" Super Admin — internal KataMereka team member.
export const currentSuperAdmin: User = {
  id: "u-super-1",
  name: "Billyaz",
  email: "billyaz@katamereka.com",
  platformRole: "SUPER_ADMIN",
  status: "ACTIVE",
  reviewCount: 0,
  joinedAt: "2022-08-01",
  lastActiveAt: "2026-09-21T09:00:00+07:00",
}
