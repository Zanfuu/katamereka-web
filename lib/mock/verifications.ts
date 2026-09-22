import type { VerificationRequest } from "@/lib/types"

export const verificationRequests: VerificationRequest[] = [
  {
    id: "v1",
    businessId: "b2",
    businessName: "Snaplease",
    submittedBy: "Dewi Lestari",
    status: "PENDING",
    documents: [
      { id: "d1", name: "NIB Snaplease.pdf", type: "NIB", uploadedAt: "2026-09-10" },
      { id: "d2", name: "KTP Dewi Lestari.jpg", type: "KTP", uploadedAt: "2026-09-10" },
    ],
    submittedAt: "2026-09-10T09:00:00+07:00",
    history: [{ status: "PENDING", note: "Dokumen diajukan.", at: "2026-09-10T09:00:00+07:00" }],
  },
  {
    id: "v2",
    businessId: "b4",
    businessName: "HotelKita Malioboro",
    submittedBy: "Rina Amelia",
    status: "PENDING",
    documents: [
      { id: "d3", name: "SIUP HotelKita.pdf", type: "SIUP", uploadedAt: "2026-09-14" },
      { id: "d4", name: "Sertifikat Bangunan.pdf", type: "Sertifikat", uploadedAt: "2026-09-14" },
    ],
    submittedAt: "2026-09-14T13:20:00+07:00",
    history: [{ status: "PENDING", note: "Dokumen diajukan.", at: "2026-09-14T13:20:00+07:00" }],
  },
  {
    id: "v3",
    businessId: "b1",
    businessName: "TransGO Rental",
    submittedBy: "Andi Pratama",
    status: "VERIFIED",
    documents: [
      { id: "d5", name: "NIB TransGO.pdf", type: "NIB", uploadedAt: "2022-11-10" },
      { id: "d6", name: "KTP Andi Pratama.jpg", type: "KTP", uploadedAt: "2022-11-10" },
    ],
    submittedAt: "2022-11-10T10:00:00+07:00",
    reviewedAt: "2022-11-14T15:00:00+07:00",
    reviewedBy: "Billyaz",
    history: [
      { status: "PENDING", note: "Dokumen diajukan.", at: "2022-11-10T10:00:00+07:00" },
      { status: "VERIFIED", note: "Dokumen lengkap dan valid.", at: "2022-11-14T15:00:00+07:00" },
    ],
  },
  {
    id: "v4",
    businessId: "b3",
    businessName: "Wisata Nusantara",
    submittedBy: "Budi Santoso",
    status: "VERIFIED",
    documents: [{ id: "d7", name: "NIB Wisata Nusantara.pdf", type: "NIB", uploadedAt: "2022-04-25" }],
    submittedAt: "2022-04-25T10:00:00+07:00",
    reviewedAt: "2022-04-28T10:00:00+07:00",
    reviewedBy: "Billyaz",
    history: [
      { status: "PENDING", note: "Dokumen diajukan.", at: "2022-04-25T10:00:00+07:00" },
      { status: "VERIFIED", note: "Dokumen lengkap dan valid.", at: "2022-04-28T10:00:00+07:00" },
    ],
  },
  {
    id: "v5",
    businessId: "b6",
    businessName: "Warung Rasa Nusantara",
    submittedBy: "Siti Nurhaliza",
    status: "VERIFIED",
    documents: [{ id: "d8", name: "NIB Warung Rasa.pdf", type: "NIB", uploadedAt: "2021-10-05" }],
    submittedAt: "2021-10-05T10:00:00+07:00",
    reviewedAt: "2021-10-09T10:00:00+07:00",
    reviewedBy: "Billyaz",
    history: [
      { status: "PENDING", note: "Dokumen diajukan.", at: "2021-10-05T10:00:00+07:00" },
      { status: "VERIFIED", note: "Dokumen lengkap dan valid.", at: "2021-10-09T10:00:00+07:00" },
    ],
  },
  {
    id: "v6",
    businessId: "b7",
    businessName: "BandungMotor Rental",
    submittedBy: "Fajar Ramadhan",
    status: "REJECTED",
    documents: [{ id: "d9", name: "SIUP BandungMotor.pdf", type: "SIUP", uploadedAt: "2024-11-10" }],
    submittedAt: "2024-11-10T10:00:00+07:00",
    reviewedAt: "2024-11-15T10:00:00+07:00",
    reviewedBy: "Billyaz",
    reason: "Dokumen SIUP tidak terbaca dan nama usaha tidak cocok dengan KTP pemohon.",
    history: [
      { status: "PENDING", note: "Dokumen diajukan.", at: "2024-11-10T10:00:00+07:00" },
      {
        status: "REJECTED",
        note: "Dokumen SIUP tidak terbaca dan nama usaha tidak cocok dengan KTP pemohon.",
        at: "2024-11-15T10:00:00+07:00",
      },
    ],
  },
  {
    id: "v7",
    businessId: "b5",
    businessName: "Griya Elektronik",
    submittedBy: "Hendra Wijaya",
    status: "UNVERIFIED",
    documents: [],
    submittedAt: "",
    history: [],
  },
]

export function getVerificationsByStatus(status: VerificationRequest["status"]) {
  return verificationRequests.filter((request) => request.status === status)
}

export function getVerificationByBusiness(businessId: string) {
  return verificationRequests.find((request) => request.businessId === businessId)
}
