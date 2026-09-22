import { CheckCircle2Icon, HeartIcon, MessageCircleIcon, StarIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const stats = [
  { label: "Review", value: 12 },
  { label: "Bisnis", value: 8 },
  { label: "Helpful", value: 34 },
]

const recentReviews = [
  { business: "TransGO", rating: 5 },
  { business: "Snaplease", rating: 4 },
]

const recentActivity = [
  { icon: HeartIcon, text: "Review kamu helpful" },
  { icon: MessageCircleIcon, text: "Business membalas" },
  { icon: CheckCircle2Icon, text: "Review diverifikasi" },
]

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Selamat datang, Andi 👋</h1>
        <p className="text-muted-foreground">
          Kelola review dan aktivitas akun kamu
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-semibold tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Review Terakhir</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentReviews.map((review) => (
              <div
                key={review.business}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span className="font-medium">{review.business}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon
                      key={index}
                      className={
                        index < review.rating
                          ? "size-4 fill-yellow-400 text-yellow-400"
                          : "size-4 text-muted-foreground"
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <activity.icon className="size-4 text-muted-foreground" />
                <span className="text-sm">{activity.text}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
