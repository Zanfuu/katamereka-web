"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, ArrowRight, Camera, Check, Star, X } from "lucide-react";
import { resolveMediaUrl } from "@/lib/api-client";

export const MOBILE_MIN_CONTENT = 15;

const STEPS = ["Rating", "Ulasan", "Foto"] as const;

const RATING_META: Record<number, { emoji: string; label: string; tone: string }> = {
  1: { emoji: "😞", label: "Sangat Buruk", tone: "bg-rose-50 text-rose-700 border-rose-200" },
  2: { emoji: "🙁", label: "Buruk", tone: "bg-orange-50 text-orange-700 border-orange-200" },
  3: { emoji: "😐", label: "Cukup", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  4: { emoji: "🙂", label: "Bagus", tone: "bg-lime-50 text-lime-700 border-lime-200" },
  5: { emoji: "🤩", label: "Sangat Bagus!", tone: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

interface MobileReviewWizardProps {
  business: { name: string; initials: string; color: string };
  isEditing: boolean;
  rating: number;
  onRatingChange: (value: number) => void;
  title: string;
  onTitleChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  photos: string[];
  onPhotoSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoRemove: (index: number) => void;
  isProcessingPhotos: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  isSubmitting: boolean;
  errorMessage: string;
  onSubmit: () => void;
  onClose: () => void;
}

const inputClass =
  "w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-[16px] font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:bg-white focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all";

export default function MobileReviewWizard({
  business,
  isEditing,
  rating,
  onRatingChange,
  title,
  onTitleChange,
  content,
  onContentChange,
  photos,
  onPhotoSelect,
  onPhotoRemove,
  isProcessingPhotos,
  fileInputRef,
  confirmed,
  onConfirmedChange,
  isSubmitting,
  errorMessage,
  onSubmit,
  onClose,
}: MobileReviewWizardProps) {
  const [step, setStep] = useState<number>(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const contentLength = content.trim().length;
  const contentOk = contentLength >= MOBILE_MIN_CONTENT;
  const isLastStep = step === STEPS.length - 1;

  const stepReady =
    step === 0
      ? rating > 0
      : step === 1
      ? title.trim().length > 0 && contentOk
      : confirmed && !isProcessingPhotos;

  const hint =
    step === 0
      ? "Pilih rating dulu untuk lanjut"
      : step === 1
      ? `Isi judul dan ulasan (minimal ${MOBILE_MIN_CONTENT} karakter) untuk lanjut`
      : confirmed
      ? ""
      : "Centang pedoman komunitas untuk mengirim ulasan";

  const goBack = () => {
    if (isSubmitting) return;
    if (step === 0) {
      onClose();
      return;
    }
    setDirection("back");
    setStep((s) => s - 1);
  };

  const goNext = () => {
    if (!stepReady || isSubmitting) return;
    if (isLastStep) {
      onSubmit();
      return;
    }
    setDirection("forward");
    setStep((s) => s + 1);
  };

  const ratingMeta = rating > 0 ? RATING_META[rating] : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tulis ulasan"
        className="w-full max-w-sm max-h-[calc(100dvh-2rem)] flex flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 fade-in duration-200"
      >
        {/* HEADER */}
        <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#008767] to-[#005f48] px-5 pt-5 pb-4 text-white">
          <div className="pointer-events-none absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -left-6 -bottom-10 w-24 h-24 rounded-full bg-white/5" />

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="relative flex items-center gap-3 pr-10">
            <div
              className={`w-11 h-11 rounded-2xl ${business.color} flex items-center justify-center font-bold text-base shadow-sm shrink-0 ring-2 ring-white/40`}
            >
              {business.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-emerald-100">
                {isEditing ? "Perbarui ulasan untuk" : "Menulis ulasan untuk"}
              </p>
              <p className="text-sm font-bold truncate">{business.name}</p>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-1.5" aria-hidden="true">
            {STEPS.map((label, index) => (
              <span
                key={label}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  index <= step ? "bg-white" : "bg-white/25"
                }`}
              />
            ))}
          </div>
          <p className="relative mt-2 text-[11px] font-semibold text-emerald-100">
            Langkah {step + 1} dari {STEPS.length} · {STEPS[step]}
          </p>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div
            key={step}
            className={`animate-in fade-in duration-300 ${
              direction === "forward" ? "slide-in-from-right-8" : "slide-in-from-left-8"
            }`}
          >
            {step === 0 && (
              <div className="flex flex-col items-center text-center gap-4 py-1">
                <div
                  key={rating}
                  className="text-6xl leading-none select-none animate-in zoom-in-50 duration-300"
                >
                  {ratingMeta ? ratingMeta.emoji : "⭐"}
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">Bagaimana pengalamanmu?</h3>
                  <p className="text-xs text-slate-500">Ketuk bintang untuk memberi rating</p>
                </div>

                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => onRatingChange(star)}
                      aria-label={`Rating ${star} dari 5`}
                      aria-pressed={star <= rating}
                      className="p-1 rounded-full focus:outline-none active:scale-90 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-9 h-9 transition-all duration-200 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-sm"
                            : "fill-slate-100 text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="h-8 flex items-center">
                  {ratingMeta ? (
                    <span
                      key={rating}
                      className={`px-3.5 py-1 rounded-full border text-xs font-bold animate-in fade-in zoom-in-95 duration-200 ${ratingMeta.tone}`}
                    >
                      {rating}.0 · {ratingMeta.label}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Belum ada rating</span>
                  )}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">Ceritakan pengalamanmu</h3>
                  <p className="text-xs text-slate-500">
                    Judul singkat dan cerita jujurmu membantu pengunjung lain.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="wizard-title" className="text-xs font-bold text-slate-800">
                      Judul Ulasan <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">{title.length}/100</span>
                  </div>
                  <input
                    id="wizard-title"
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Contoh: Pelayanan ramah dan cepat"
                    maxLength={100}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="wizard-content" className="text-xs font-bold text-slate-800">
                      Ulasan Detail <span className="text-rose-500">*</span>
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        contentOk ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {contentOk ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>{content.length}/1000</span>
                        </>
                      ) : (
                        <span>
                          Minimal {MOBILE_MIN_CONTENT} karakter ({contentLength}/{MOBILE_MIN_CONTENT})
                        </span>
                      )}
                    </span>
                  </div>
                  <textarea
                    id="wizard-content"
                    rows={5}
                    value={content}
                    onChange={(e) => onContentChange(e.target.value)}
                    placeholder="Ceritakan apa yang kamu rasakan saat menggunakan layanan ini..."
                    maxLength={1000}
                    className={`${inputClass} leading-relaxed resize-none`}
                  />
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        contentOk ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                      style={{
                        width: `${Math.min(100, (contentLength / MOBILE_MIN_CONTENT) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Tambah foto{" "}
                    <span className="text-sm font-medium text-slate-400">(opsional)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Maksimal 4 foto (maks. 10MB per foto). Foto asli bikin ulasanmu lebih dipercaya.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={onPhotoSelect}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  multiple
                  className="hidden"
                />

                <div className="grid grid-cols-3 gap-2">
                  {photos.map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200"
                    >
                      <img
                        src={resolveMediaUrl(url)}
                        alt={`Foto ulasan ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => onPhotoRemove(index)}
                        aria-label={`Hapus foto ${index + 1}`}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {photos.length < 4 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessingPhotos}
                      className="flex flex-col items-center justify-center gap-1 aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008767] hover:bg-emerald-50/40 text-slate-500 hover:text-[#008767] transition-all cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-wait"
                    >
                      {isProcessingPhotos ? (
                        <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                      <span className="text-[11px] font-semibold text-center leading-tight">
                        {isProcessingPhotos ? "Memproses" : "Tambah"}
                      </span>
                    </button>
                  )}
                </div>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                    confirmed
                      ? "bg-emerald-50/70 border-emerald-200"
                      : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => onConfirmedChange(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 accent-[#008767] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Saya mengonfirmasi bahwa ulasan ini adalah hasil pengalaman jujur saya sendiri,
                    tidak memuat promosi tersembunyi, dan saya telah menyetujui{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#008767] underline font-semibold"
                    >
                      Pedoman Komunitas
                    </Link>{" "}
                    Katamereka.
                  </span>
                </label>

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-medium animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-5 pt-3 pb-4 space-y-2">
          {!stepReady && hint && (
            <p className="text-center text-[11px] font-medium text-slate-400">{hint}</p>
          )}
          <div className="grid grid-cols-[1fr_1.6fr] gap-3">
            <button
              type="button"
              onClick={goBack}
              disabled={isSubmitting}
              className="py-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={goNext}
              disabled={!stepReady || isSubmitting}
              className="py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? "Menyimpan..." : "Mengirim..."}</span>
                </>
              ) : isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? "Simpan Perubahan" : "Kirim Ulasan"}</span>
                </>
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
