"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

function buildTabs(businessId: string) {
  const base = `/super-admin/businesses/${businessId}`
  return [
    { value: "overview", label: "Overview", href: base },
    { value: "reviews", label: "Reviews", href: `${base}/reviews` },
    { value: "analytics", label: "Analytics", href: `${base}/analytics` },
    { value: "invitations", label: "Invitations", href: `${base}/invitations` },
    { value: "profile", label: "Profile", href: `${base}/profile` },
    { value: "locations", label: "Locations", href: `${base}/locations` },
    { value: "team", label: "Team", href: `${base}/team` },
    { value: "verification", label: "Verification", href: `${base}/verification` },
    { value: "reports", label: "Reports", href: `${base}/reports` },
    { value: "audit-log", label: "Audit Log", href: `${base}/audit-log` },
    { value: "settings", label: "Settings", href: `${base}/settings` },
  ]
}

export function BusinessDetailTabs({ businessId }: { businessId: string }) {
  const pathname = usePathname()
  const tabs = buildTabs(businessId)
  const base = `/super-admin/businesses/${businessId}`

  const active =
    tabs.find((tab) => tab.href !== base && pathname.startsWith(tab.href))?.value ?? "overview"

  return (
    <Tabs value={active}>
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} render={<Link href={tab.href} />}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
