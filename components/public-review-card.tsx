import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { resolveMediaUrl, type ApiLatestReview } from "@/lib/api-client";
import { formatRelativeDate } from "@/lib/api-profile";
import { categoryDisplayName } from "@/lib/slug";

function initialsOf(name: string | null | undefined): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function Avatar({
  src,
  name,
  className,
}: {
  src: string | null | undefined;
  name: string | null | undefined;
  className: string;
}) {
  const url = resolveMediaUrl(src);
  if (url) {
    return <img src={url} alt={name || ""} className={`${className} object-cover`} />;
  }
  return (
    <div
      aria-hidden="true"
      className={`${className} bg-[#ecf8f3] text-[#008767] font-bold flex items-center justify-center text-xs`}
    >
      {initialsOf(name)}
    </div>
  );
}

/** Review from GET /reviews/latest, shown on the home page and the all-reviews list. */
export default function PublicReviewCard({ review }: { review: ApiLatestReview }) {
  const text = [review.title, review.content].filter(Boolean).join(" — ");
  const biz = review.business;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-lg hover:border-slate-300 transition-all space-y-4">
      <div>
        <div className="flex items-center gap-3">
          <Avatar
            src={review.user?.avatar_url}
            name={review.user?.name}
            className="w-10 h-10 rounded-full shrink-0 border border-slate-100"
          />
          <div className="min-w-0">
            <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight truncate">
              {review.user?.name || "Pengguna Katamereka"}
            </h4>
            <span className="text-xs text-slate-400 font-normal">
              {formatRelativeDate(review.created_at)}
            </span>
          </div>
        </div>

        <div
          className="flex items-center gap-0.5 my-2.5"
          role="img"
          aria-label={`Rating ${review.rating} dari 5`}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
            />
          ))}
        </div>

        {text && (
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal line-clamp-4">
            &ldquo;{text}&rdquo;
          </p>
        )}
      </div>

      {biz && (
        <Link
          href={`/business/${biz.slug}`}
          className="bg-[#fafcfb] border border-slate-200/70 rounded-xl p-2.5 flex items-center justify-between group/biz hover:bg-[#f0f8f4] transition-colors mt-2"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar src={biz.logo_url} name={biz.name} className="w-9 h-9 rounded-lg shrink-0 bg-slate-100" />
            <div className="min-w-0">
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover/biz:text-[#008767] transition-colors">
                {biz.name}
              </h5>
              <p className="text-[11px] text-slate-400 truncate">
                {[biz.category ? categoryDisplayName(biz.category) : null, biz.city].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#ecf8f3] text-[#008767] flex items-center justify-center shrink-0 group-hover/biz:bg-[#008767] group-hover/biz:text-white transition-colors ml-2">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      )}
    </div>
  );
}
