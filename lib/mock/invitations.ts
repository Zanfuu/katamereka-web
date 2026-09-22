import type { Invitation } from "@/lib/types"

export const invitations: Invitation[] = [
  {
    id: "inv1",
    businessId: "b1",
    businessName: "TransGO",
    customerName: "Hari Kusuma",
    contact: "hari.kusuma@gmail.com",
    referenceId: "TRX-88213",
    channel: "EMAIL",
    sentAt: "2026-09-18T10:00:00+07:00",
    status: "COMPLETED",
    reviewGenerated: true,
  },
  {
    id: "inv2",
    businessId: "b1",
    businessName: "TransGO",
    customerName: "Lestari Wulandari",
    contact: "0812-3456-7890",
    referenceId: "TRX-88250",
    channel: "WHATSAPP",
    sentAt: "2026-09-19T14:00:00+07:00",
    status: "OPENED",
    reviewGenerated: false,
  },
  {
    id: "inv3",
    businessId: "b1",
    businessName: "TransGO",
    customerName: "Agus Setiadi",
    contact: "agus.setiadi@gmail.com",
    referenceId: "TRX-88301",
    channel: "EMAIL",
    sentAt: "2026-09-20T09:00:00+07:00",
    status: "SENT",
    reviewGenerated: false,
  },
  {
    id: "inv4",
    businessId: "b1",
    businessName: "TransGO",
    customerName: "Novi Andriani",
    contact: "0813-9988-1122",
    referenceId: "TRX-87990",
    channel: "WHATSAPP",
    sentAt: "2026-09-05T09:00:00+07:00",
    status: "EXPIRED",
    reviewGenerated: false,
  },
]

export function getInvitationsByBusiness(businessId: string) {
  return invitations.filter((invitation) => invitation.businessId === businessId)
}
