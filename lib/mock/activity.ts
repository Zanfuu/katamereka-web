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
  { id: "pa1", icon: "reply", text: "Andi Pratama membalas review dari Putri Handayani.", at: "2026-09-21T10:00:00+07:00" },
  { id: "pa2", icon: "verification", text: "Pengajuan verifikasi baru dari Snaplease.", at: "2026-09-21T08:00:00+07:00" },
  { id: "pa3", icon: "review", text: "Review baru diterima untuk Wisata Nusantara.", at: "2026-09-21T07:00:00+07:00" },
  { id: "pa4", icon: "report", text: "User Akun Tidak Dikenal dilaporkan oleh sistem.", at: "2026-09-21T06:00:00+07:00" },
  { id: "pa5", icon: "evidence", text: "Bukti transaksi diunggah untuk Report #rep1.", at: "2026-09-21T04:00:00+07:00" },
  { id: "pa6", icon: "business", text: "Business baru terdaftar: HotelKita Malioboro.", at: "2026-09-21T02:00:00+07:00" },
]
