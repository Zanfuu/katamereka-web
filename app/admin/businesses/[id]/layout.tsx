import Link from "next/link"
import { notFound } from "next/navigation"
import { HomeIcon, ShieldIcon } from "lucide-react"

import { BusinessAdminActions } from "@/components/business-admin-actions"
import { BusinessDetailTabs } from "@/components/business-detail-tabs"
import { StatusBadge } from "@/components/status-badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getBusinessById } from "@/lib/mock/businesses"

export default async function BusinessDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const business = getBusinessById(id)

  if (!business) notFound()

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin" />}>
              <HomeIcon className="size-3.5" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/admin/businesses" />}>Businesses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{business.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 px-3 py-2 text-sm font-medium text-info">
        <ShieldIcon className="size-4" />
        Viewing <span className="font-semibold">{business.name}</span> as Super Admin
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{business.name}</h1>
          <p className="text-sm text-muted-foreground">
            {business.category} · {business.city}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={business.verificationStatus} />
          <StatusBadge status={business.status} />
          <BusinessAdminActions business={business} />
        </div>
      </div>

      <BusinessDetailTabs businessId={id} />

      {children}
    </div>
  )
}
