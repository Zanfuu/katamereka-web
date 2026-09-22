import type { ActivityItem } from "@/lib/types"

export const businessActivity: Record<string, ActivityItem[]> = {
  b1: [
    { id: "a1", icon: "reply", text: "Admin membalas review dari Putri Handayani.", at: "2026-09-18T10:00:00+07:00" },
    { id: "a2", icon: "review", text: "Review baru diterima dari Salsabila Putri.", at: "2026-09-21T07:10:00+07:00" },
    { id: "a3", icon: "verification", text: "Verifikasi bisnis disetujui KataMereka.", at: "2022-11-14T15:00:00+07:00" },
    { id: "a4", icon: "team", text: "Eka Putri diundang sebagai anggota tim.", at: "2026-09-15T09:00:00+07:00" },
    { id: "a5", icon: "report", text: "Review dari Melati Sari dilaporkan untuk investigasi.", at: "2026-09-16T15:00:00+07:00" },
  ],
}

export const platformActivity: ActivityItem[] = [
  { id: "pa1", icon: "verification", text: "Sarah Wijaya menyetujui verifikasi TransGO.", at: "2022-11-14T15:00:00+07:00" },
  { id: "pa2", icon: "report", text: "Sarah Wijaya menghapus review #r15 dari PropertyHub Indonesia.", at: "2026-09-05T11:30:00+07:00" },
  { id: "pa3", icon: "review", text: "Review baru masuk dari Wulan Ratna untuk Snaplease.", at: "2026-09-18T12:00:00+07:00" },
  { id: "pa4", icon: "team", text: "Business Admin baru mendaftar: Rina Amelia (HotelKita Malioboro).", at: "2024-01-09T10:00:00+07:00" },
  { id: "pa5", icon: "report", text: "Review #r14 disembunyikan karena terindikasi fraud.", at: "2026-09-08T06:10:00+07:00" },
]
