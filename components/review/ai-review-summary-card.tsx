"use client";

import * as React from "react";
import {
  Sparkles,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Star,
  Quote,
} from "lucide-react";
import type { ApiBusinessReviewAiSummary, ApiReviewAspectSentiment } from "@/lib/api-client";
import { regenerateBusinessReviewAiSummary } from "@/lib/api-client";
import { toast } from "sonner";

interface AiReviewSummaryCardProps {
  summary: ApiBusinessReviewAiSummary | null;
  businessId?: string;
  canRefresh?: boolean;
  onSummaryUpdated?: (newSummary: ApiBusinessReviewAiSummary) => void;
  className?: string;
}

export function AiReviewSummaryCard({
  summary,
  businessId,
  canRefresh = false,
  onSummaryUpdated,
  className = "",
}: AiReviewSummaryCardProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [currentSummary, setCurrentSummary] = React.useState<ApiBusinessReviewAiSummary | null>(
    summary
  );

  React.useEffect(() => {
    setCurrentSummary(summary);
  }, [summary]);

  const handleRefresh = async () => {
    if (!businessId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const updated = await regenerateBusinessReviewAiSummary(businessId);
      if (updated && updated.summary) {
        setCurrentSummary(updated);
        onSummaryUpdated?.(updated);
        toast.success("Ringkasan ulasan AI berhasil diperbarui!");
      } else {
        toast.info("Gagal memperbarui ringkasan ulasan. Pastikan ulasan mencukupi.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses ringkasan AI.");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentSummary || !currentSummary.summary) {
    if (canRefresh && businessId) {
      return (
        <div
          className={`rounded-2xl border border-dashed border-emerald-300 bg-emerald-50/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#008767] text-white shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Analisis Ulasan AI (MAIA Router)
              </h4>
              <p className="text-xs text-slate-500">
                Ringkasan ulasan dan analisis sentimen per layanan belum dibuat untuk bisnis ini.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#008767] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#007458] disabled:opacity-50 transition-colors cursor-pointer flex-shrink-0"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Sedang Menganalisis..." : "Buat Ringkasan AI"}</span>
          </button>
        </div>
      );
    }
    return null;
  }

  const {
    summary: narrative,
    aspects = [],
    pros = [],
    cons = [],
    sample_quotes = [],
    total_reviews_analyzed = 0,
    updated_at,
  } = currentSummary;

  const getSentimentBadge = (sentiment: ApiReviewAspectSentiment["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-[#008767] border border-emerald-200/60">
            Positif
          </span>
        );
      case "negative":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60">
            Perlu Perhatian
          </span>
        );
      case "neutral":
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200/60">
            Netral
          </span>
        );
    }
  };

  const getBarColor = (sentiment: ApiReviewAspectSentiment["sentiment"]) => {
    switch (sentiment) {
      case "positive":
        return "bg-[#008767]";
      case "negative":
        return "bg-rose-500";
      case "neutral":
      default:
        return "bg-amber-400";
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/30 p-5 sm:p-7 shadow-xs transition-all ${className}`}
    >
      {/* Decorative top accent badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-emerald-100/70">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#008767] text-white shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                Ringkasan AI KataMereka
              </h4>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-[#008767]">
                Didukung MAIA Router
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Analisis ulasan otomatis berbasis kecerdasan buatan
            </p>
          </div>
        </div>

        {canRefresh && businessId && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            title="Perbarui analisa ulasan dengan data review terbaru"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-slate-500 ${isRefreshing ? "animate-spin text-[#008767]" : ""}`}
            />
            <span>{isRefreshing ? "Memproses..." : "Refresh Analisis"}</span>
          </button>
        )}
      </div>

      {/* Main Narrative Summary */}
      <div className="mt-4">
        <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line font-normal">
          {narrative}
        </p>
      </div>

      {/* Aspect-Based Sentiments / Layanan Breakdown */}
      {aspects.length > 0 && (
        <div className="mt-6 space-y-3.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Penilaian Berdasarkan Layanan & Aspek
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {aspects.map((aspect, idx) => {
              const scoreVal = typeof aspect.score === "number" ? aspect.score : 4.0;
              const percent = Math.min(100, Math.max(10, Math.round((scoreVal / 5.0) * 100)));

              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/70 bg-white/80 p-3.5 backdrop-blur-xs transition-shadow hover:shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {aspect.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {getSentimentBadge(aspect.sentiment)}
                      <div className="flex items-center gap-0.5 text-xs font-bold text-slate-700">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{scoreVal.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getBarColor(aspect.sentiment)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  {aspect.summary && (
                    <p className="mt-2 text-[11px] leading-snug text-slate-600">
                      {aspect.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pros & Cons Highlights */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pros */}
          {pros.length > 0 && (
            <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/30 p-3.5 sm:p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4 text-[#008767] flex-shrink-0" />
                <span>Hal yang Disukai Pelanggan</span>
              </div>
              <ul className="mt-2.5 space-y-1.5">
                {pros.map((pro, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 leading-snug"
                  >
                    <span className="text-[#008767] font-bold mt-0.5">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cons */}
          {cons.length > 0 && (
            <div className="rounded-xl border border-amber-200/70 bg-amber-50/30 p-3.5 sm:p-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span>Perhatian & Masukan Pelanggan</span>
              </div>
              <ul className="mt-2.5 space-y-1.5">
                {cons.map((con, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700 leading-snug"
                  >
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Sample Quotes snippet if available */}
      {sample_quotes.length > 0 && (
        <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Kutipan Suara Pelanggan:
          </span>
          <div className="flex flex-wrap gap-2">
            {sample_quotes.slice(0, 3).map((sq, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1 text-[11px] italic text-slate-600 border border-slate-200/60"
              >
                <Quote className="h-3 w-3 text-slate-400 rotate-180 flex-shrink-0" />
                <span>&ldquo;{sq.quote}&rdquo;</span>
                {sq.aspect && (
                  <span className="not-italic font-semibold text-[#008767] text-[10px]">
                    ({sq.aspect})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        <div>
          Berdasarkan analisis {total_reviews_analyzed > 0 ? `${total_reviews_analyzed} ulasan` : "ulasan pelanggan terkini"}
        </div>
        {updated_at && (
          <div>
            Terakhir diperbarui:{" "}
            {new Date(updated_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        )}
      </div>
    </div>
  );
}
