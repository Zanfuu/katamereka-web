"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/navbar";
import { getBusinessBySlug, businesses, Business } from "@/lib/mock-data";
import { fetchBusinessBySlug, mapApiBusinessToUiModel, API_BASE_URL, sendOtpApi } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import GoogleLoginButton from "@/components/google-login-button";
import {
  Star,
  UploadCloud,
  CheckCircle2,
  X,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Camera,
  Sparkles,
  Info,
  Building2,
  Check,
  Lock,
  Mail,
  User as UserIcon,
  KeyRound,
  LogIn,
  UserPlus,
  Edit3,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowRight
} from "lucide-react";

function WriteReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slugParam = searchParams.get("business") || "sunny-cafe";
  const { user, isLoggedIn, login, signup } = useAuth();

  const [selectedSlug, setSelectedSlug] = useState<string>(slugParam);
  const [business, setBusiness] = useState<Business>(getBusinessBySlug(slugParam));
  // Real business UUID from API (needed to POST review to correct endpoint)
  const [realBusinessId, setRealBusinessId] = useState<string | null>(null);

  // Inline Auth states for non-logged-in users
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authRegisterStep, setAuthRegisterStep] = useState<"form" | "otp">("form");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState<string>("");
  const [authUsername, setAuthUsername] = useState<string>("");
  const [showAuthPassword, setShowAuthPassword] = useState<boolean>(false);
  const [showAuthConfirmPassword, setShowAuthConfirmPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [isAuthProcessing, setIsAuthProcessing] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendMessage, setResendMessage] = useState<string>("");

  // 6-digit OTP state boxes
  const [authOtpDigits, setAuthOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const authOtpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown before "Kirim Ulang OTP" can be pressed again
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Shadcn Dialog Modal state
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>("Berhasil Masuk! 🎉");
  const [modalMessage, setModalMessage] = useState<string>(
    "Selamat datang kembali! Akun kamu berhasil terverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan."
  );

  // Form states
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    rating?: string;
    title?: string;
    content?: string;
    confirmed?: string;
  }>({});

  // Refs for auto-scrolling to invalid sections
  const ratingSectionRef = useRef<HTMLDivElement>(null);
  const titleSectionRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const contentSectionRef = useRef<HTMLDivElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);
  const confirmedSectionRef = useRef<HTMLDivElement>(null);
  const errorBannerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState<boolean>(false);

  // Existing review detection (1 review per account per business)
  const [existingReview, setExistingReview] = useState<any | null>(null);
  const [checkingExisting, setCheckingExisting] = useState<boolean>(false);

  // Fetch real business data from API whenever slug changes
  useEffect(() => {
    if (slugParam) {
      setSelectedSlug(slugParam);
      fetchBusinessBySlug(slugParam)
        .then((res) => {
          if (res?.data) {
            if (res.data.id) setRealBusinessId(res.data.id);
            const uiModel = mapApiBusinessToUiModel(res.data);
            setBusiness(uiModel);
          } else {
            setBusiness(getBusinessBySlug(slugParam));
          }
        })
        .catch(() => {
          setBusiness(getBusinessBySlug(slugParam));
        });
    }
  }, [slugParam]);

  // Check if logged-in user already has a review for this business
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token || !isLoggedIn) {
      setExistingReview(null);
      return;
    }

    const targetId = realBusinessId || business?.id;
    if (!targetId && !slugParam) return;

    let isMounted = true;
    setCheckingExisting(true);

    fetch(`${API_BASE_URL}/my-reviews`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (!isMounted) return;
        const myReviews = res?.data || [];
        const match = myReviews.find(
          (r: any) =>
            (targetId && (r.business?.id === targetId || r.businessId === targetId)) ||
            (slugParam && r.business?.slug === slugParam)
        );
        if (match) {
          setExistingReview(match);
          if (match.rating) setRating(match.rating);
          if (match.title) setTitle(match.title);
          if (match.content) setContent(match.content);
          if (Array.isArray(match.photos)) setPhotos(match.photos);
          setConfirmed(true);
        } else {
          setExistingReview(null);
        }
      })
      .catch(() => {
        if (isMounted) setExistingReview(null);
      })
      .finally(() => {
        if (isMounted) setCheckingExisting(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, realBusinessId, business?.id, slugParam]);

  // Handler for OTP input box change
  const handleAuthOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...authOtpDigits];
    newOtp[index] = digit;
    setAuthOtpDigits(newOtp);

    // Auto-focus next input box
    if (digit && index < 5) {
      authOtpRefs.current[index + 1]?.focus();
    }
  };

  // Handler for OTP backspace navigation
  const handleAuthOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!authOtpDigits[index] && index > 0) {
        authOtpRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handler for pasting 6-digit OTP code
  const handleAuthOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData) {
      const newOtp = [...authOtpDigits];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setAuthOtpDigits(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      authOtpRefs.current[focusIndex]?.focus();
    }
  };

  // Resend OTP code handler
  const handleResendAuthOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp) return;
    setAuthError("");

    setIsSendingOtp(true);
    const res = await sendOtpApi({ email: authEmail.trim(), type: "REGISTRATION" });
    setIsSendingOtp(false);

    if (!res.success) {
      setAuthError(res.message);
      return;
    }

    setResendMessage("Kode OTP baru telah dikirim ke email Anda.");
    setAuthOtpDigits(["", "", "", "", "", ""]);
    setResendCooldown(60);
    authOtpRefs.current[0]?.focus();
    setTimeout(() => {
      setResendMessage("");
    }, 4000);
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail.trim()) {
      setAuthError("Email wajib diisi.");
      return;
    }

    if (!authPassword || authPassword.length < 6) {
      setAuthError("Password minimal 6 karakter.");
      return;
    }

    setIsAuthProcessing(true);
    const resLogin = await login(authEmail.trim(), authPassword);
    setIsAuthProcessing(false);

    if (resLogin.success) {
      setModalTitle("Berhasil Masuk! 🎉");
      setModalMessage(
        "Selamat datang kembali! Akun kamu berhasil terverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan."
      );
      setShowSuccessModal(true);
    } else {
      setAuthError(resLogin.message || "Gagal masuk. Periksa kembali email dan password kamu.");
    }
  };

  // Step 1 Registration Form Submission (Send OTP & Proceed to Step 2)
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authUsername.trim()) {
      setAuthError("Username wajib diisi.");
      return;
    }

    if (!authEmail.trim() || !authEmail.includes("@")) {
      setAuthError("Masukkan alamat email yang valid.");
      return;
    }

    if (!authPassword || authPassword.length < 6) {
      setAuthError("Kata sandi minimal harus 6 karakter.");
      return;
    }

    if (authPassword !== authConfirmPassword) {
      setAuthError("Konfirmasi kata sandi tidak cocok dengan kata sandi Anda.");
      return;
    }

    setIsSendingOtp(true);
    const res = await sendOtpApi({ email: authEmail.trim(), type: "REGISTRATION" });
    setIsSendingOtp(false);

    if (!res.success) {
      setAuthError(res.message || "Gagal mengirimkan kode OTP. Silakan periksa kembali email Anda.");
      return;
    }

    setAuthError("");
    setAuthOtpDigits(["", "", "", "", "", ""]);
    setResendCooldown(60);
    setAuthRegisterStep("otp");
    setTimeout(() => {
      authOtpRefs.current[0]?.focus();
    }, 80);
  };

  // Step 2 Registration Submission (Verify OTP & Register)
  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const fullOtp = authOtpDigits.join("");
    if (fullOtp.length !== 6) {
      setAuthError("Kode OTP harus lengkap 6 digit angka.");
      return;
    }

    setIsAuthProcessing(true);
    const resSignup = await signup(
      authUsername.trim(),
      authEmail.trim(),
      authPassword,
      "customer",
      fullOtp
    );
    setIsAuthProcessing(false);

    if (resSignup.success) {
      setModalTitle("Pendaftaran Berhasil! 🎉");
      setModalMessage(
        `Selamat datang, @${authUsername.trim().toLowerCase()}! Akun kamu berhasil dibuat dan diverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan.`
      );
      setShowSuccessModal(true);
    } else {
      setAuthError(resSignup.message || "Gagal memproses pendaftaran. Silakan periksa kembali kode OTP Anda.");
    }
  };

  const handleSelectBusiness = (newSlug: string) => {
    setSelectedSlug(newSlug);
    setBusiness(getBusinessBySlug(newSlug));
    setRealBusinessId(null); // reset while fetching
    fetchBusinessBySlug(newSlug).then((res) => {
      if (res?.data?.id) setRealBusinessId(res.data.id);
    });
    router.replace(`/review?business=${newSlug}`);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        resolve("");
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const availableSlots = 4 - photos.length;
    if (availableSlots <= 0) {
      toast.error("Maksimal 4 foto yang dapat diunggah.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    if (files.length > availableSlots) {
      toast.warning(`Hanya ${availableSlots} foto yang ditambahkan (maksimal 4 foto).`);
    }

    setIsProcessingPhotos(true);
    try {
      const newPhotoUrls: string[] = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith("image/")) {
          toast.error(`File "${file.name}" bukan format gambar yang valid.`);
          continue;
        }
        if (file.size > 15 * 1024 * 1024) {
          toast.error(`Ukuran "${file.name}" melebihi 15MB.`);
          continue;
        }
        const compressed = await compressImage(file);
        if (compressed) {
          newPhotoUrls.push(compressed);
        }
      }

      if (newPhotoUrls.length > 0) {
        setPhotos((prev) => [...prev, ...newPhotoUrls].slice(0, 4));
        toast.success(`${newPhotoUrls.length} foto berhasil ditambahkan.`);
      }
    } catch {
      toast.error("Gagal memproses foto. Silakan coba lagi.");
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const scrollToField = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    // 1. Validasi Rating
    if (rating === 0) {
      const msg = "Silakan beri rating (bintang 1 - 5) untuk bisnis ini.";
      setErrorMessage(msg);
      setFieldErrors({ rating: msg });
      toast.error(msg);
      scrollToField(ratingSectionRef);
      return;
    }

    // 2. Validasi Judul
    if (!title.trim()) {
      const msg = "Silakan isi judul ulasan Anda.";
      setErrorMessage(msg);
      setFieldErrors({ title: msg });
      toast.error(msg);
      scrollToField(titleSectionRef);
      setTimeout(() => {
        titleInputRef.current?.focus({ preventScroll: true });
      }, 300);
      return;
    }

    // 3. Validasi Isi Ulasan (minimal 15 karakter)
    if (content.trim().length < 15) {
      const msg =
        content.trim().length === 0
          ? "Silakan tulis ulasan pengalaman Anda (minimal 15 karakter)."
          : "Ulasan terlalu singkat. Minimal 15 karakter untuk memberikan ulasan yang bermanfaat.";
      setErrorMessage(msg);
      setFieldErrors({ content: msg });
      toast.error(msg);
      scrollToField(contentSectionRef);
      setTimeout(() => {
        contentTextareaRef.current?.focus({ preventScroll: true });
      }, 300);
      return;
    }

    // 4. Validasi Checkbox Konfirmasi
    if (!confirmed) {
      const msg = "Anda wajib mengonfirmasi bahwa ulasan ini berdasarkan pengalaman pribadi.";
      setErrorMessage(msg);
      setFieldErrors({ confirmed: msg });
      toast.error(msg);
      scrollToField(confirmedSectionRef);
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      const targetId = realBusinessId || business.id;

      if (!token) {
        setErrorMessage("Anda harus login terlebih dahulu untuk mengirim ulasan.");
        setIsSubmitting(false);
        scrollToField(errorBannerRef);
        return;
      }

      if (!targetId) {
        setErrorMessage("Data bisnis tidak ditemukan. Silakan refresh halaman.");
        setIsSubmitting(false);
        scrollToField(errorBannerRef);
        return;
      }

      // If user already has a review, update it via PATCH /reviews/:id
      if (existingReview?.id) {
        const res = await fetch(`${API_BASE_URL}/reviews/${existingReview.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating,
            title: title.trim(),
            content: content.trim(),
            photos,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrorMessage(data?.message || "Gagal memperbarui ulasan. Silakan coba lagi.");
          setIsSubmitting(false);
          scrollToField(errorBannerRef);
          return;
        }

        toast.success("Ulasan Anda berhasil diperbarui!");
        router.push(`/business/${business.slug}`);
        return;
      }

      // Otherwise create a new review via POST /businesses/:id/reviews
      const res = await fetch(`${API_BASE_URL}/businesses/${targetId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title: title.trim(),
          content: content.trim(),
          photos,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage(
            data?.message ||
              "Anda sudah pernah memberikan ulasan untuk bisnis ini. Silakan muat ulang halaman untuk memperbarui ulasan Anda."
          );
        } else {
          setErrorMessage(data?.message || "Gagal mengirim ulasan. Silakan coba lagi.");
        }
        setIsSubmitting(false);
        scrollToField(errorBannerRef);
        return;
      }

      // Success — navigate to success page
      router.push(`/review/success?business=${business.slug}`);
    } catch (err) {
      setErrorMessage("Terjadi kesalahan koneksi. Silakan periksa koneksi internet Anda.");
      setIsSubmitting(false);
      scrollToField(errorBannerRef);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 1:
        return "1.0 - Sangat Buruk 😞";
      case 2:
        return "2.0 - Buruk 🙁";
      case 3:
        return "3.0 - Cukup 😐";
      case 4:
        return "4.0 - Bagus 🙂";
      case 5:
        return "5.0 - Sangat Bagus! 😀";
      default:
        return "Klik bintang untuk memilih rating";
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans flex flex-col justify-between">
      <div>
        <Navbar />

        {/* BREADCRUMB & HEADER */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          <div className="space-y-3">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Link href="/" className="hover:text-[#008767] transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/businesses" className="hover:text-[#008767] transition-colors">
                Daftar Bisnis
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href={`/business/${business.slug}`} className="hover:text-[#008767] transition-colors truncate max-w-[150px]">
                {business.name}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[#008767] font-semibold">Tulis Ulasan</span>
            </nav>

            {/* HEADER TITLE CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
                  {existingReview ? "Perbarui Ulasan Bisnis" : "Tulis Ulasan Bisnis"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                  {existingReview
                    ? "Ubah penilaian bintang atau perbarui cerita pengalamanmu tentang bisnis ini."
                    : "Bagikan pengalaman jujurmu untuk membantu calon pelanggan lain dalam membuat keputusan yang lebih baik."}
                </p>
              </div>

              <Link
                href={`/business/${business.slug}`}
                className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-2xl border border-slate-200/80 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 text-slate-700 hover:text-[#008767] font-semibold text-xs transition-all self-start md:self-auto shadow-2xs shrink-0 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-[#008767]" />
                <span>Kembali ke Bisnis</span>
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT 8 COLUMNS: FORM AREA */}
            <div className="lg:col-span-8 space-y-6">

              {/* CARD 1: BUSINESS SELECTION BANNER */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl ${business.color} flex items-center justify-center font-bold text-xl shadow-xs shrink-0`}
                  >
                    {business.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#008767] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                        {business.category}
                      </span>
                      {business.badge && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-[#008767]" />
                          {business.badge}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">
                      {business.name}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>📍 {business.location}</span>
                      <span>•</span>
                      {business.rating > 0 && business.reviewCount > 0 ? (
                        <>
                          <span className="font-semibold text-amber-600 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {business.rating.toFixed(1)}
                          </span>
                          <span>({business.reviewCountFormatted})</span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-normal">-</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2: INLINE AUTH PROMPT (If not logged in) OR REVIEW FORM (If logged in) */}
              {!isLoggedIn ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2 pb-4 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-[#008767] flex items-center justify-center mx-auto shadow-2xs">
                      {authMode === "register" && authRegisterStep === "otp" ? (
                        <KeyRound className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {authMode === "login"
                        ? "Masuk untuk Menulis Ulasan"
                        : authRegisterStep === "otp"
                        ? "Verifikasi Kode OTP"
                        : "Daftar Akun untuk Menulis Ulasan"}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                      {authMode === "login"
                        ? "Kamu harus memiliki akun Katamereka untuk memberikan ulasan jujur dan membantu calon pengunjung lainnya."
                        : authRegisterStep === "otp"
                        ? `Masukkan kode OTP 6-digit yang telah dikirimkan ke email ${authEmail}.`
                        : "Lengkapi pendaftaran di bawah ini untuk mulai memberikan ulasan jujur bagi komunitas Katamereka."}
                    </p>
                  </div>

                  {/* Mode Selector Tabs (Masuk vs Daftar) - Disembunyikan saat input OTP */}
                  {!(authMode === "register" && authRegisterStep === "otp") && (
                    <div className="flex rounded-2xl bg-slate-100 p-1.5 font-semibold text-xs border border-slate-200/60">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setAuthMode("login");
                          setAuthRegisterStep("form");
                          setAuthError("");
                          setResendMessage("");
                        }}
                        className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                          authMode === "login"
                            ? "bg-white text-[#008767] shadow-md font-extrabold ring-1 ring-slate-200/80"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                      >
                        <LogIn className="w-4 h-4" />
                        <span>Masuk (Login)</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setAuthMode("register");
                          setAuthRegisterStep("form");
                          setAuthError("");
                          setResendMessage("");
                        }}
                        className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer select-none ${
                          authMode === "register"
                            ? "bg-[#008767] text-white shadow-md font-extrabold ring-1 ring-[#007458]"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Daftar Akun</span>
                      </button>
                    </div>
                  )}

                  {/* Auth Error Alert */}
                  {authError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium animate-fadeIn">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  {/* Resend Notice */}
                  {resendMessage && (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-[#008767] shrink-0" />
                      <span>{resendMessage}</span>
                    </div>
                  )}

                  {/* 1. LOGIN FORM */}
                  {authMode === "login" && (
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Email field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                        </div>
                      </div>

                      {/* Password field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={isAuthProcessing}
                        className="w-full py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-3 cursor-pointer"
                      >
                        {isAuthProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Memproses Masuk...</span>
                          </>
                        ) : (
                          <span>Masuk & Lanjutkan Review</span>
                        )}
                      </button>

                      {/* Separator */}
                      <div className="relative my-3 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200/80" />
                        </div>
                        <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                          atau masuk dengan
                        </span>
                      </div>

                      <GoogleLoginButton
                        roleHint="customer"
                        text="signin_with"
                        shape="rounded-2xl"
                        onSuccess={(loggedUser) => {
                          setModalTitle("Berhasil Masuk! 🎉");
                          setModalMessage(
                            `Selamat datang kembali, @${loggedUser?.username || "pengguna"}! Akun kamu berhasil terverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan.`
                          );
                          setShowSuccessModal(true);
                        }}
                        onError={(msg) => setAuthError(msg)}
                      />

                      <div className="pt-2 text-center text-xs text-slate-500">
                        <span>Belum punya akun? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("register");
                            setAuthRegisterStep("form");
                            setAuthError("");
                          }}
                          className="font-bold text-[#008767] hover:underline cursor-pointer"
                        >
                          Daftar Akun Baru
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 2. REGISTER STEP 1: FORM LENGKAP */}
                  {authMode === "register" && authRegisterStep === "form" && (
                    <form onSubmit={handleProceedToOtp} className="space-y-4">
                      {/* Username field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Username <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="text"
                            required
                            value={authUsername}
                            onChange={(e) => setAuthUsername(e.target.value)}
                            placeholder="Contoh: dewi_lestari"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                        </div>
                      </div>

                      {/* Email field */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type="email"
                            required
                            value={authEmail}
                            onChange={(e) => setAuthEmail(e.target.value)}
                            placeholder="nama@email.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                        </div>
                      </div>

                      {/* Kata Sandi */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Kata Sandi <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showAuthPassword ? "text" : "password"}
                            required
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            placeholder="Minimal 6 karakter"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthPassword(!showAuthPassword)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showAuthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400">Minimal 6 karakter</p>
                      </div>

                      {/* Konfirmasi Kata Sandi */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-800">
                          Konfirmasi Kata Sandi <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                          <input
                            type={showAuthConfirmPassword ? "text" : "password"}
                            required
                            value={authConfirmPassword}
                            onChange={(e) => setAuthConfirmPassword(e.target.value)}
                            placeholder="Ulangi kata sandi"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20 transition-all bg-slate-50/50"
                          />
                          <button
                            type="button"
                            onClick={() => setShowAuthConfirmPassword(!showAuthConfirmPassword)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showAuthConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Proceed to OTP button */}
                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="w-full py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-3 cursor-pointer"
                      >
                        {isSendingOtp ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Mengirim Kode OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Daftar & Kirim Kode OTP</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Separator */}
                      <div className="relative my-3 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-slate-200/80" />
                        </div>
                        <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                          atau daftar dengan
                        </span>
                      </div>

                      <GoogleLoginButton
                        roleHint="customer"
                        text="signup_with"
                        shape="rounded-2xl"
                        onSuccess={(loggedUser) => {
                          setModalTitle("Pendaftaran Berhasil! 🎉");
                          setModalMessage(
                            `Selamat datang, @${loggedUser?.username || "pengguna"}! Akun kamu berhasil dibuat dan diverifikasi. Sekarang kamu dapat melanjutkan menulis ulasan.`
                          );
                          setShowSuccessModal(true);
                        }}
                        onError={(msg) => setAuthError(msg)}
                      />

                      <div className="pt-2 text-center text-xs text-slate-500">
                        <span>Sudah punya akun? </span>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMode("login");
                            setAuthError("");
                          }}
                          className="font-bold text-[#008767] hover:underline cursor-pointer"
                        >
                          Masuk di sini
                        </button>
                      </div>
                    </form>
                  )}

                  {/* 3. REGISTER STEP 2: VERIFIKASI KODE OTP */}
                  {authMode === "register" && authRegisterStep === "otp" && (
                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-5 animate-fadeIn">
                      <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
                        <Info className="w-4 h-4 text-[#008767] shrink-0 mt-0.5" />
                        <div>
                          <span>Kode verifikasi 6 digit telah dikirim ke </span>
                          <strong className="font-bold text-slate-900">{authEmail}</strong>.
                          <span> Silakan cek kotak masuk atau folder spam email kamu.</span>
                        </div>
                      </div>

                      {/* 6 INDIVIDUAL OTP DIGIT BOXES */}
                      <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-3">
                        {authOtpDigits.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => {
                              authOtpRefs.current[index] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleAuthOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleAuthOtpKeyDown(index, e)}
                            onPaste={handleAuthOtpPaste}
                            className="w-10 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold font-mono text-slate-900 bg-slate-50/90 border border-slate-200 focus:border-[#008767] focus:bg-white focus:ring-2 focus:ring-[#008767]/20 rounded-2xl outline-none transition-all shadow-xs"
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-400 text-center font-medium">
                        Pastikan Kode OTP Sesuai
                      </p>

                      {/* Resend OTP */}
                      <div className="flex items-center justify-between text-xs pt-1 pb-1">
                        <span className="text-slate-500">Tidak menerima kode?</span>
                        <button
                          type="button"
                          onClick={handleResendAuthOtp}
                          disabled={resendCooldown > 0 || isSendingOtp}
                          className="inline-flex items-center gap-1.5 font-bold text-[#008767] hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSendingOtp ? "animate-spin" : ""}`} />
                          <span>
                            {isSendingOtp
                              ? "Mengirim..."
                              : resendCooldown > 0
                              ? `Kirim Ulang (${resendCooldown}s)`
                              : "Kirim Ulang OTP"}
                          </span>
                        </button>
                      </div>

                      {/* Verify Button */}
                      <button
                        type="submit"
                        disabled={isAuthProcessing}
                        className="w-full py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md shadow-[#008767]/20 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70 mt-3 cursor-pointer"
                      >
                        {isAuthProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Memverifikasi OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Verifikasi & Selesaikan Pendaftaran</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Back to Form Button */}
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthRegisterStep("form");
                            setAuthError("");
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Ubah Email atau Data Pendaftaran</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-8">
                  {/* USER SESSION PREVIEW */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#008767] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        {user?.initials || "DL"}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Menulis sebagai</p>
                        <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user?.name || "Dewi Lestari"}</span>
                          <span className="text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-200">
                            @{user?.username || "dewilestari"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <span className="inline-flex items-center gap-1 text-xs text-[#008767] font-semibold bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Reviewer Terverifikasi</span>
                      </span>
                    </div>
                  </div>

                  {/* EXISTING REVIEW NOTIFICATION BANNER */}
                  {existingReview && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs animate-in fade-in">
                      <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-bold text-sm text-amber-950">
                          Kamu Sudah Pernah Memberikan Ulasan untuk Bisnis Ini
                        </p>
                        <p className="text-amber-800 leading-relaxed">
                          Setiap akun dibatasi <strong>1 ulasan per bisnis</strong>. Ulasanmu sebelumnya telah otomatis dimuat di bawah ini. Kamu dapat mengubah nilai rating bintang atau memperbarui isi ceritamu.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ERROR ALERT IF ANY */}
                  {errorMessage && (
                    <div
                      ref={errorBannerRef}
                      className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-700 text-xs font-medium animate-in fade-in"
                    >
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-rose-800 mb-0.5">Mohon lengkapi formulir</p>
                        <p>{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* ITEM 1: STAR RATING */}
                  <div ref={ratingSectionRef} className="space-y-3 pb-6 border-b border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-900">
                        Masukkan Rating Sesuai Dengan Pengalaman Kamu <span className="text-rose-500">*</span>
                      </label>
                    </div>

                    <div
                      className={`flex items-center p-3.5 sm:p-4 rounded-2xl transition-all ${
                        fieldErrors.rating
                          ? "bg-rose-50/40 border border-rose-300 ring-2 ring-rose-200"
                          : "bg-slate-50/70 border border-slate-200/60"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setRating(star);
                              if (fieldErrors.rating) {
                                setFieldErrors((prev) => ({ ...prev, rating: undefined }));
                                setErrorMessage("");
                              }
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                            aria-label={`Rating ${star} dari 5`}
                          >
                            <Star
                              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors ${
                                star <= displayRating
                                  ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                                  : "fill-slate-200 text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {fieldErrors.rating && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{fieldErrors.rating}</span>
                      </p>
                    )}
                  </div>

                  {/* ITEM 2: REVIEW TITLE */}
                  <div ref={titleSectionRef} className="space-y-2">
                    <label htmlFor="review-title" className="block text-sm font-bold text-slate-900">
                      Judul Ulasan <span className="text-rose-500">*</span>
                    </label>
                    <input
                      ref={titleInputRef}
                      id="review-title"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (fieldErrors.title && e.target.value.trim()) {
                          setFieldErrors((prev) => ({ ...prev, title: undefined }));
                          setErrorMessage("");
                        }
                      }}
                      placeholder="Contoh: Tempatnya sangat nyaman, kopi enak, & pelayanan ramah!"
                      maxLength={100}
                      className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all font-medium placeholder:text-slate-400 ${
                        fieldErrors.title
                          ? "border-rose-400 ring-2 ring-rose-200 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200"
                          : "border-slate-200 focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20"
                      }`}
                    />
                    {fieldErrors.title && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{fieldErrors.title}</span>
                      </p>
                    )}
                  </div>

                  {/* ITEM 3: REVIEW CONTENT */}
                  <div ref={contentSectionRef} className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label htmlFor="review-content" className="text-sm font-bold text-slate-900">
                        Ulasan Detail Pengalamanmu <span className="text-rose-500">*</span>
                      </label>
                      <span
                        className={`text-[11px] font-medium ${
                          content.length >= 15 ? "text-emerald-600 font-semibold" : "text-slate-500"
                        }`}
                      >
                        (Minimal 15 karakter)
                      </span>
                    </div>
                    <textarea
                      ref={contentTextareaRef}
                      id="review-content"
                      rows={6}
                      value={content}
                      onChange={(e) => {
                        setContent(e.target.value);
                        if (fieldErrors.content && e.target.value.trim().length >= 15) {
                          setFieldErrors((prev) => ({ ...prev, content: undefined }));
                          setErrorMessage("");
                        }
                      }}
                      maxLength={1000}
                      className={`w-full px-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all font-medium placeholder:text-slate-400 leading-relaxed ${
                        fieldErrors.content
                          ? "border-rose-400 ring-2 ring-rose-200 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-200"
                          : "border-slate-200 focus:border-[#008767] focus:ring-2 focus:ring-[#008767]/20"
                      }`}
                    />
                    {fieldErrors.content && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{fieldErrors.content}</span>
                      </p>
                    )}
                  </div>

                  {/* ITEM 4: UPLOAD PHOTOS */}
                  <div className="space-y-3 pb-4 border-b border-slate-100">
                    <div>
                      <label className="block text-sm font-bold text-slate-900">
                        Unggah Foto <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        (Maksimal 4 foto)
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoSelect}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      multiple
                      className="hidden"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Previews */}
                      {photos.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-2xl overflow-hidden aspect-video sm:aspect-square bg-slate-100 border border-slate-200"
                        >
                          <img
                            src={url}
                            alt={`Foto ulasan ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                            title="Hapus foto"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Photo Button */}
                      {photos.length < 4 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isProcessingPhotos}
                          className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008767] hover:bg-emerald-50/40 text-slate-500 hover:text-[#008767] transition-all aspect-video sm:aspect-square cursor-pointer active:scale-95 disabled:opacity-60 disabled:cursor-wait"
                        >
                          {isProcessingPhotos ? (
                            <div className="w-6 h-6 border-2 border-[#008767] border-t-transparent rounded-full animate-spin mb-1" />
                          ) : (
                            <Camera className="w-6 h-6 mb-1 text-slate-400 group-hover:text-[#008767]" />
                          )}
                          <span className="text-xs font-semibold text-center">
                            {isProcessingPhotos ? "Memproses..." : "Tambah Foto"}
                          </span>
                          <span className="text-[10px] text-slate-400 text-center mt-0.5">JPG / PNG</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ITEM 5: VERIFICATION CHECKBOX */}
                  <div
                    ref={confirmedSectionRef}
                    className={`p-4 rounded-2xl border transition-all ${
                      fieldErrors.confirmed
                        ? "bg-rose-50/60 border-rose-300 ring-2 ring-rose-200"
                        : "bg-slate-50 border-slate-200/80"
                    }`}
                  >
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        onChange={(e) => {
                          setConfirmed(e.target.checked);
                          if (fieldErrors.confirmed && e.target.checked) {
                            setFieldErrors((prev) => ({ ...prev, confirmed: undefined }));
                            setErrorMessage("");
                          }
                        }}
                        className="mt-1 w-4 h-4 text-[#008767] rounded border-slate-300 focus:ring-[#008767]"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        Saya mengonfirmasi bahwa ulasan ini adalah hasil pengalaman jujur saya sendiri, tidak memuat promosi tersembunyi, dan saya telah menyetujui{" "}
                        <Link href="/terms" className="text-[#008767] underline font-semibold">
                          Pedoman Komunitas
                        </Link>{" "}
                        Katamereka.
                      </span>
                    </label>
                    {fieldErrors.confirmed && (
                      <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 mt-2 animate-in fade-in">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                        <span>{fieldErrors.confirmed}</span>
                      </p>
                    )}
                  </div>

                  {/* SUBMIT BUTTONS */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2">
                    <Link
                      href={`/business/${business.slug}`}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors text-center"
                    >
                      Batal
                    </Link>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{existingReview ? "Menyimpan Perubahan..." : "Mengirim Ulasan..."}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>{existingReview ? "Simpan Perubahan Ulasan" : "Kirim Ulasan Sekarang"}</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

            {/* RIGHT 4 COLUMNS: SIDEBAR GUIDELINES */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

              {/* CARD 1: TIPS MENULIS ULASAN */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Tips Ulasan Berkualitas
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008767] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Jujur & Spesifik</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Sebutkan detail menu, pelayanan, atau fasilitas yang kamu rasakan secara langsung.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008767] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Sertakan Foto Realistis</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Foto makanan, suasana tempat, atau invoice membantu meningkatkan rasa percaya pembaca.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#008767] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Sopan & Konstruktif</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        Jika ada kendala, sampaikan masukan secara santun tanpa menggunakan kata-kata kasar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD 2: BADGE & PENCAPAIAN INFO */}
              <div className="bg-gradient-to-br from-[#008767] to-[#005f48] rounded-3xl p-6 text-white space-y-4 shadow-sm">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Suaramu Sangat Berarti!</h3>
                  <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                    Setiap ulasan yang kamu tulis membantu UMKM berkembang dan memberikan petunjuk tepercaya bagi komunitas Katamereka.
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200">
                  <span>Badge Reviewer Aktif</span>
                  <span className="font-semibold text-white">+10 Poin Aktivitas</span>
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>

      {/* SHADCN STYLE SUCCESS DIALOG MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200 relative">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#008767] flex items-center justify-center mx-auto border-4 border-emerald-50 shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                {modalTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {modalMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3.5 rounded-2xl bg-[#008767] hover:bg-[#007458] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Lanjutkan Tulis Review</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Katamereka. Platform Review Bisnis Terpercaya No. 1 Indonesia.</p>
        </div>
      </footer>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat formulir review...</span>
          </div>
        </div>
      }
    >
      <WriteReviewContent />
    </Suspense>
  );
}
