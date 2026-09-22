"use client"

import * as React from "react"
import { FlagIcon, MessageSquareTextIcon, StarIcon } from "lucide-react"

import { useBusinessContext } from "@/components/business-provider"
import { PageHeader } from "@/components/page-header"
import { ReplyDialog } from "@/components/reply-dialog"
import { ReviewCard } from "@/components/review-card"
import { SearchInput } from "@/components/search-input"
import { FilterDropdown } from "@/components/filter-dropdown"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/empty-state"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { getReviewsByBusiness } from "@/lib/mock/reviews"

const RATING_TABS = [
  { value: "all", label: "Semua" },
  { value: "5", label: "5 Bintang" },
  { value: "4", label: "4 Bintang" },
  { value: "3", label: "3 Bintang" },
  { value: "2", label: "2 Bintang" },
  { value: "1", label: "1 Bintang" },
] as const

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "replied", label: "Sudah Dibalas" },
  { value: "unreplied", label: "Belum Dibalas" },
]

const VERIFIED_OPTIONS = [
  { value: "all", label: "Semua" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
]

export default function AdminAllReviewsPage() {
  const { selectedBusiness } = useBusinessContext()
  const [tab, setTab] = React.useState<string>("all")
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [verifiedFilter, setVerifiedFilter] = React.useState("all")

  if (!selectedBusiness) return null

  const reviews = getReviewsByBusiness(selectedBusiness.id)
  const unrepliedCount = reviews.filter((review) => !review.reply).length
  const reportedCount = reviews.filter((review) => review.reportCount > 0).length
  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0"

  const filtered = reviews.filter((review) => {
    if (tab !== "all" && String(review.rating) !== tab) return false
    if (statusFilter === "replied" && !review.reply) return false
    if (statusFilter === "unreplied" && review.reply) return false
    if (verifiedFilter === "verified" && !review.isVerified) return false
    if (verifiedFilter === "unverified" && review.isVerified) return false
    if (
      search &&
      !review.reviewerName.toLowerCase().includes(search.toLowerCase()) &&
      !review.content.toLowerCase().includes(search.toLowerCase())
    ) {
      return false
    }
    return true
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Semua Review"
        description="Lihat, cari, filter, dan tanggapi review customer."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 @5xl/main:grid-cols-4">
        <StatCard label="Total Review" value={reviews.length} icon={MessageSquareTextIcon} />
        <StatCard label="Average Rating" value={averageRating} icon={StarIcon} />
        <StatCard label="Belum Dibalas" value={unrepliedCount} deltaTone="neutral" />
        <StatCard label="Reported" value={reportedCount} deltaTone="negative" icon={FlagIcon} />
      </div>

      <Tabs value={tab} onValueChange={(value) => typeof value === "string" && setTab(value)}>
        <TabsList className="w-full overflow-x-auto sm:w-fit">
          {RATING_TABS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari customer, isi review, atau keyword..."
        />
        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterDropdown
            label="Verifikasi"
            options={VERIFIED_OPTIONS}
            value={verifiedFilter}
            onChange={setVerifiedFilter}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <EmptyState
            icon={MessageSquareTextIcon}
            title="Belum ada review."
            description="Review dari customer akan muncul di sini."
          />
        )}
        {filtered.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showModerationStatus={review.reportCount > 0}
            actions={
              <>
                {!review.reply && <ReplyDialog review={review} />}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toast.info("Review dilaporkan untuk ditinjau tim KataMereka.")}
                >
                  Laporkan
                </Button>
              </>
            }
          />
        ))}
      </div>
    </div>
  )
}
