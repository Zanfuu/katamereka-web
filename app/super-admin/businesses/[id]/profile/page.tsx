import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getBusinessById } from "@/lib/mock/businesses"

export default async function BusinessDetailProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const business = getBusinessById(id)
  if (!business) return null

  const rows: [string, string][] = [
    ["Business Name", business.name],
    ["Slug", business.slug],
    ["Category", business.category],
    ["Website", business.website ?? "-"],
    ["Phone", business.phone ?? "-"],
    ["Email", business.email ?? "-"],
    ["Address", business.address],
    ["City", `${business.city}, ${business.province}`],
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-foreground/90">{business.description}</p>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-sm font-medium text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
