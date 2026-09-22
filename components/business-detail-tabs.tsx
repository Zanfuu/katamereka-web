"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

function buildTabs(businessId: string) {
  const base = `/admin/businesses/${businessId}`
  return [
    { value: "overview", label: "Overview", href: base },
    { value: "reviews", label: "Reviews", href: `${base}/reviews` },
    { value: "invitations", label: "Invitations", href: `${base}/invitations` },
    { value: "analytics", label: "Analytics", href: `${base}/analytics` },
    { value: "business", label: "Business", href: `${base}/business` },
    { value: "activity", label: "Activity", href: `${base}/activity` },
  ]
}

export function BusinessDetailTabs({ businessId }: { businessId: string }) {
  const pathname = usePathname()
  const tabs = buildTabs(businessId)
  const base = `/admin/businesses/${businessId}`

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
