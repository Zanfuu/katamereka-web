const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatDate(iso: string) {
  if (!iso) return "-"
  return dateFormatter.format(new Date(iso))
}

export function formatDateTime(iso: string) {
  if (!iso) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function timeAgo(iso: string, reference = new Date("2026-09-21T12:00:00+07:00")) {
  if (!iso) return "-"
  const diffMs = reference.getTime() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "Baru saja"
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} bulan lalu`
  return `${Math.floor(months / 12)} tahun lalu`
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}
