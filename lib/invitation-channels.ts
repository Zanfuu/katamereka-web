import { LinkIcon, MailIcon, MessageCircleIcon, QrCodeIcon, type LucideIcon } from "lucide-react"

import type { InvitationChannel } from "@/lib/types"

export const CHANNEL_META: Record<
  InvitationChannel,
  { label: string; icon: LucideIcon; description: string }
> = {
  EMAIL: { label: "Email", icon: MailIcon, description: "Kirim undangan melalui email" },
  WHATSAPP: {
    label: "WhatsApp",
    icon: MessageCircleIcon,
    description: "Kirim undangan melalui WhatsApp",
  },
  LINK: { label: "Review Link", icon: LinkIcon, description: "Dapatkan link untuk dibagikan" },
  QR_CODE: {
    label: "QR Code",
    icon: QrCodeIcon,
    description: "Generate QR code untuk dicetak",
  },
}
