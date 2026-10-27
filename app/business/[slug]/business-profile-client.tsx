"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { isBusinessHost } from "@/lib/site-config";
import BusinessTrustScoreView from "@/components/business-trustscore-view";
import {
  fetchBusinessBySlug,
  fetchBusinessPlaceImage,
  ApiBusinessDetail,
  ApiReviewSummary,
  API_BASE_URL,
  fetchClaimStatus,
  createBusinessClaim,
  BusinessClaimStatus,
  VerificationMethod,
  resolveMediaUrl,
  getAuthToken,
} from "@/lib/api-client";
import {
  formatRelativeDate,
  formatStarRating,
  deleteReview,
  fetchMyFavorites,
  toggleFavorite,
  unfavoriteBusiness,
  recordBusinessView,
  toggleReviewHelpful,
  fetchMyHelpfulVotes,
} from "@/lib/api-profile";
import { recordBusinessViewActivity } from "@/lib/recent-activity";
import { resolveFacilitiesDescription, resolveFacilitiesList } from "@/lib/facilities";
import { resolveSocialLinks } from "@/lib/social-media";
import { SOCIAL_STYLES } from "@/components/social-icons";
import { getCleanCategory, slugify } from "@/lib/slug";
import { LoginDialog } from "@/components/login-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronDown,
  Star,
  CheckCircle2,
  ShieldCheck,
  Share2,
  Bookmark,
  Edit3,
  Phone,
  MapPin,
  Clock,
  Calendar,
  ImageIcon,
  ThumbsUp,
  MessageCircle,
  MoreVertical,
  ArrowUp,
  LayoutDashboard,
  MessageSquare,
  Globe,
  Store,
  Scissors,
  Utensils,
  Building2,
  Building,
  Car,
  HeartPulse,
  Wifi,
  Snowflake,
  UserCheck,
  BedDouble,
  HelpCircle,
  ExternalLink,
  Copy,
  Trash2,
  RefreshCw,
  Eye,
  Maximize2,
  Coffee,
  Waves,
  Dumbbell,
  Users,
  Tv,
  Accessibility,
  CreditCard,
  Sparkles,
  Mail,
  Map,
  FileText,
  UploadCloud,
  Check,
  X,
} from "lucide-react";
import Navbar from "@/components/navbar";
import { useAuth } from "@/lib/auth-context";
import ShareBusinessModal from "@/components/share-business-modal";

interface BusinessReview {
  id: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
  created_at?: string;
  userId?: string;
  user_id?: string;
  user?: { id?: string; name?: string; initials?: string };
  helpfulCount?: number;
  helpful_count?: number;
  photos?: string[];
}

function coverOf(detail: ApiBusinessDetail | null): string | null {
  if (!detail) return null;
  const raw =
    detail.coverUrl ||
    detail.cover_url ||
    (Array.isArray(detail.photos) && detail.photos.length > 0 ? detail.photos[0] : null) ||
    detail.logoUrl ||
    detail.logo_url;
  return raw ? resolveMediaUrl(raw) : null;
}

/**
 * `initialDetail` / `initialReviews` come from the server component (page.tsx),
 * so the first HTML response already contains the business name, rating,
 * address and reviews for crawlers that don't run JavaScript. The effects below
 * still refresh the data in the background once the page hydrates.
 */
export default function BusinessProfilePage({
  initialDetail = null,
  initialReviews = [],
  initialReviewSummary = null,
}: {
  initialDetail?: ApiBusinessDetail | null;
  initialReviews?: BusinessReview[];
  initialReviewSummary?: ApiReviewSummary | null;
}) {
  const params = useParams();
  const slug = (params.slug as string) || "";
  const { user, isLoggedIn } = useAuth();

  const [reviewSummary, setReviewSummary] = useState<ApiReviewSummary | null>(initialReviewSummary ?? null);
  const [isBusinessDomain, setIsBusinessDomain] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read ?from= from window instead of useSearchParams(): useSearchParams()
  // forces the nearest Suspense boundary to client-render on a statically
  // generated page, which would drop the SSR'd content again.
  useEffect(() => {
    const fromParam = new URLSearchParams(window.location.search).get("from");
    const isBizHost = isBusinessHost(window.location.hostname);
    setIsBusinessDomain(isBizHost || fromParam === "business" || fromParam === "bisnis");
  }, []);

  const hasInitialDetail = Boolean(initialDetail);
  const [apiDetail, setApiDetail] = useState<ApiBusinessDetail | null>(initialDetail);
  const [placeImageUrl, setPlaceImageUrl] = useState<string | null>(coverOf(initialDetail));
  const [loading, setLoading] = useState(!initialDetail);
  const [notFoundState, setNotFoundState] = useState(false);
  const [activeTab, setActiveTab] = useState<"profil" | "review" | "foto" | "info">("profil");
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [previewPhotoModalUrl, setPreviewPhotoModalUrl] = useState<string | null>(null);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isTentangOpen, setIsTentangOpen] = useState(false);
  const [isFasilitasOpen, setIsFasilitasOpen] = useState(false);
  const [claimStatus, setClaimStatus] = useState<BusinessClaimStatus | null>(null);
  const [isBusinessMember, setIsBusinessMember] = useState(false);
  const [claimStatusLoading, setClaimStatusLoading] = useState(false);
  // Owner state comes from GET /businesses/slug/:slug (is_claimed = flag OR an OWNER member).
  const claimedSinceLabel = (() => {
    if (!apiDetail?.claimed_at) return null;
    const d = new Date(apiDetail.claimed_at);
    return isNaN(d.getTime())
      ? null
      : d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  })();
  const isClaimedByOwner =
    apiDetail?.is_claimed === true ||
    apiDetail?.isClaimed === true ||
    apiDetail?.claim_available === false ||
    apiDetail?.status === "CLAIMED";
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimForm, setClaimForm] = useState<{
    role: "Owner" | "Manager" | "Admin" | "Staff" | "Lainnya";
    custom_role: string;
    verification_method: VerificationMethod;
    verification_proof: string;
    document_file: File | null;
    document_file_name: string;
    phone: string;
    message: string;
  }>({
    role: "Owner",
    custom_role: "",
    verification_method: "DOCUMENT",
    verification_proof: "",
    document_file: null,
    document_file_name: "",
    phone: "",
    message: "",
  });
  const [claimDocumentUploading, setClaimDocumentUploading] = useState(false);
  const claimFileInputRef = useRef<HTMLInputElement>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);

  // ── Business Reviews State ──────────────────────────────────────────────────
  const [businessReviews, setBusinessReviews] = useState<BusinessReview[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [myHelpfulVoteIds, setMyHelpfulVoteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setMyHelpfulVoteIds(new Set());
      return;
    }
    fetchMyHelpfulVotes().then((ids) => {
      if (Array.isArray(ids)) {
        setMyHelpfulVoteIds(new Set(ids));
      }
    });
  }, [isLoggedIn]);

  useEffect(() => {
    async function loadApiBusinessDetail() {
      if (!slug) return;
      // With server-provided data we refresh silently: no spinner, no flash of
      // "not found", and the SSR'd image/text stay on screen.
      if (!hasInitialDetail) {
        setLoading(true);
        setPlaceImageUrl(null);
      }
      setNotFoundState(false);
      try {
        const res = await fetchBusinessBySlug(slug);
        if (res && res.data) {
          setApiDetail(res.data);
          if (res.data.id) {
            recordBusinessView(res.data.id);
          }
          recordBusinessViewActivity({
            slug: res.data.slug || slug,
            name: res.data.name,
            imageUrl: coverOf(res.data),
          });
          // Prioritize backend cover_url / photos[0] / logo_url
          const existingCover = coverOf(res.data);

          if (existingCover) {
            setPlaceImageUrl(existingCover);
          } else if (res.data.name) {
            const loc = res.data.city || res.data.province || "Palembang";
            fetchBusinessPlaceImage(
              res.data.name,
              loc,
              res.data.latitude,
              res.data.longitude
            )
              .then((img) => {
                if (img) setPlaceImageUrl(img);
              })
              .catch(() => { });
          }
        } else if (!hasInitialDetail) {
          setApiDetail(null);
          setNotFoundState(true);
        }
      } catch (err) {
        console.warn("Error loading business detail:", err);
        if (!hasInitialDetail) {
          setApiDetail(null);
          setNotFoundState(true);
        }
      } finally {
        setLoading(false);
      }
    }
    loadApiBusinessDetail();
  }, [slug]);

  useEffect(() => {
    async function loadClaimStatus() {
      if (!isLoggedIn || !apiDetail?.id) return;
      setClaimStatusLoading(true);
      try {
        const res = await fetchClaimStatus(apiDetail.id);
        setClaimStatus(res.status);
        setIsBusinessMember(Boolean(res.is_member));
      } finally {
        setClaimStatusLoading(false);
      }
    }
    loadClaimStatus();
  }, [isLoggedIn, apiDetail?.id]);

  // ── Sync Favorite Status ──────────────────────────────────────────────────
  useEffect(() => {
    async function checkFavoriteStatus() {
      if (!isLoggedIn || !apiDetail?.id) return;
      try {
        const res = await fetchMyFavorites();
        if (res?.success && Array.isArray(res.data)) {
          const found = res.data.some((fav) => fav.business?.id === apiDetail.id);
          setIsSaved(found);
        }
      } catch (err) {
        console.warn("Failed checking favorite status:", err);
      }
    }
    checkFavoriteStatus();
  }, [isLoggedIn, apiDetail?.id]);

  // ── Toggle Favorite Handler ───────────────────────────────────────────────
  async function handleToggleSave() {
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu untuk menyimpan bisnis");
      return;
    }
    if (!apiDetail?.id || savingFavorite) return;

    setSavingFavorite(true);
    try {
      if (isSaved) {
        const res = await unfavoriteBusiness(apiDetail.id);
        if (res?.success) {
          setIsSaved(false);
          toast.success("Bisnis berhasil dihapus dari daftar favorit");
        } else {
          toast.error(res?.message || "Gagal menghapus favorit");
        }
      } else {
        const res = await toggleFavorite(apiDetail.id);
        if (res?.success) {
          setIsSaved(true);
          toast.success("Bisnis berhasil ditambahkan ke daftar favorit");
        } else {
          toast.error(res?.message || "Gagal menyimpan favorit");
        }
      }
    } catch {
      toast.error("Terjadi kesalahan saat memproses favorit");
    } finally {
      setSavingFavorite(false);
    }
  }

  // ── Fetch Reviews & Review Summary ──────────────────────────────────────────
  useEffect(() => {
    if (!apiDetail?.id) return;
    // Only show the skeleton when there is nothing server-rendered to keep.
    if (initialReviews.length === 0) setLoadingReviews(true);

    fetch(`${API_BASE_URL}/businesses/${apiDetail.id}/reviews`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setBusinessReviews(data.data);
        } else if (data?.reviews && Array.isArray(data.reviews)) {
          setBusinessReviews(data.reviews);
        }
        if (typeof data?.pagination?.total === "number") {
          setReviewSummary((prev) =>
            prev
              ? { ...prev, review_count: data.pagination.total }
              : {
                  average_rating: typeof apiDetail.rating === "number" ? apiDetail.rating : 0,
                  review_count: data.pagination.total,
                  distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
                }
          );
        }
      })
      .catch(() => { })
      .finally(() => setLoadingReviews(false));

    fetch(`${API_BASE_URL}/businesses/${apiDetail.id}/review-summary`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((summary) => {
        if (summary && typeof summary.review_count === "number") {
          setReviewSummary(summary);
        }
      })
      .catch(() => { });
  }, [apiDetail?.id]);

  async function handleDeleteReview(reviewId: string) {
    setDeletingReviewId(reviewId);
    const res = await deleteReview(reviewId);
    if (res?.success) {
      const remaining = businessReviews.filter((r) => r.id !== reviewId);
      setBusinessReviews(remaining);
      // recalculate count & average rating dynamically (optimistic update)
      if (apiDetail) {
        const newCount = Math.max(0, (reviewSummary?.review_count ?? actualReviewCount) - 1);
        const sum = remaining.reduce((acc, r) => {
          const rat = typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0));
          return acc + (isNaN(rat) ? 0 : rat);
        }, 0);
        const newAvg = remaining.length > 0 ? parseFloat((sum / remaining.length).toFixed(1)) : 0;
        setReviewSummary((prev) =>
          prev
            ? { ...prev, review_count: newCount }
            : null
        );
        setApiDetail({
          ...apiDetail,
          reviewCount: newCount,
          reviews_count: newCount,
          averageRating: newAvg,
          rating: newAvg,
        });
      }
    }
    setDeletingReviewId(null);
    setConfirmDeleteId(null);
  }

  async function handleSubmitClaim() {
    if (!apiDetail?.id) return;
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu untuk mengklaim bisnis ini.");
      return;
    }

    const effectiveRole =
      claimForm.role === "Lainnya"
        ? (claimForm.custom_role.trim() || "Lainnya")
        : claimForm.role;

    if (!effectiveRole) {
      toast.error("Harap tentukan jabatan Anda di bisnis ini.");
      return;
    }

    const hasProof = Boolean(
      claimForm.document_file || claimForm.verification_proof.trim()
    );
    if (!hasProof) {
      toast.error("Harap lengkapi bukti verifikasi sesuai metode yang dipilih.");
      return;
    }

    setClaimSubmitting(true);
    try {
      let finalProofUrl = "";

      // If document file is selected, upload to S3 first
      if (claimForm.document_file) {
        setClaimDocumentUploading(true);
        try {
          const formData = new FormData();
          formData.append("photo", claimForm.document_file);
          formData.append("file", claimForm.document_file);
          const token = getAuthToken();
          const uploadRes = await fetch(`${API_BASE_URL}/reviews/upload-photo`, {
            method: "POST",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (data?.url) {
              finalProofUrl = data.url;
            }
          }
        } catch (uploadErr) {
          console.warn("Gagal upload file bukti:", uploadErr);
        } finally {
          setClaimDocumentUploading(false);
        }
      }

      if (!finalProofUrl && (claimForm.verification_proof.startsWith("http://") || claimForm.verification_proof.startsWith("https://"))) {
        finalProofUrl = claimForm.verification_proof.trim();
      }

      const res = await createBusinessClaim(apiDetail.id, {
        verification_method: claimForm.verification_method,
        proof_url: finalProofUrl || undefined,
        verification_data: {
          role: effectiveRole,
          claimant_phone: claimForm.phone.trim() || undefined,
          verification_value: claimForm.verification_proof.trim() || finalProofUrl || undefined,
          verification_method: claimForm.verification_method,
          business_name: apiDetail.name,
          business_address: displayLocation,
          user_name: user?.name,
          user_email: user?.email,
        },
        message: [
          `[Jabatan: ${effectiveRole}]`,
          claimForm.phone.trim() ? `[No. HP: ${claimForm.phone.trim()}]` : null,
          claimForm.verification_proof.trim() ? `[Bukti (${claimForm.verification_method}): ${claimForm.verification_proof.trim()}]` : null,
          claimForm.message.trim() ? `\nPesan: ${claimForm.message.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" "),
      });

      if (res.success) {
        toast.success(res.message || "Klaim berhasil dikirim, menunggu peninjauan admin.");
        setClaimStatus("PENDING");
        setClaimModalOpen(false);
      } else {
        toast.error(res.message || "Gagal mengirim klaim bisnis");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan koneksi saat mengirim klaim");
    } finally {
      setClaimSubmitting(false);
    }
  }

  const initials = apiDetail?.name
    ? apiDetail.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "KM";

  // Check if current logged-in user already wrote a review for this business
  const myReview = user?.id
    ? businessReviews.find(
      (r) => r.user?.id === user?.id || r.userId === user?.id || r.user_id === user?.id
    )
    : null;
  const hasReviewed = Boolean(myReview);

  // Dynamic review count from API (reviewSummary, reviewCount, reviewsCount, reviews_count, externalReviewsCount)
  const rawReviewCount =
    reviewSummary?.review_count ??
    (apiDetail as any)?.reviewCount ??
    (apiDetail as any)?.review_count ??
    (apiDetail as any)?.reviewsCount ??
    apiDetail?.reviews_count ??
    apiDetail?.externalReviewsCount ??
    0;
  let reviewCountVal = typeof rawReviewCount === "number" ? rawReviewCount : (parseInt(String(rawReviewCount || 0), 10) || 0);
  if (isNaN(reviewCountVal)) reviewCountVal = 0;

  // Dynamic average rating from API (reviewSummary, averageRating, rating, avg, average_rating)
  const rawRating =
    reviewSummary?.average_rating ??
    (apiDetail as any)?.averageRating ??
    (apiDetail as any)?.average_rating ??
    (apiDetail as any)?.avg ??
    (apiDetail as any)?.avg_rating ??
    apiDetail?.rating ??
    apiDetail?.externalRating ??
    (apiDetail as any)?.external_rating ??
    null;
  let ratingVal = rawRating !== null && rawRating !== undefined ? (typeof rawRating === "number" ? rawRating : parseFloat(String(rawRating || 0))) : 0;
  if (isNaN(ratingVal)) ratingVal = 0;

  // Real dynamic review count and rating (prioritizing true count from API/review-summary over paginated slice)
  const actualReviewCount =
    reviewCountVal > 0
      ? reviewCountVal
      : businessReviews.length;

  const actualRating =
    ratingVal > 0
      ? (ratingVal > 5 ? parseFloat((ratingVal / 2).toFixed(1)) : ratingVal)
      : businessReviews.length > 0
      ? parseFloat(
        (
          businessReviews.reduce((acc, r) => {
            const rat = typeof r.rating === "number" ? r.rating : parseFloat(String(r.rating ?? 0));
            return acc + (isNaN(rat) ? 0 : rat);
          }, 0) / businessReviews.length
        ).toFixed(1)
      )
      : 0;

  const ratingFormatted = actualRating > 0 ? actualRating.toFixed(1) : "0.0";
  const reviewCountFormatted = `${actualReviewCount} ulasan`;

  const formattedCategory = getCleanCategory(
    (apiDetail as any)?.categories,
    apiDetail?.category
  );

  const cleanValue = (val?: any) => {
    if (val === null || val === undefined) return "-";
    if (typeof val === "object") {
      if (Array.isArray(val) && val.length > 0) {
        val = val.map((v) => (typeof v === "object" ? JSON.stringify(v) : String(v))).join(", ");
      } else {
        return "-";
      }
    }
    const str = String(val).trim();
    if (!str || str === "-" || str === "null" || str === "undefined" || str === "none" || str === "[object Object]") {
      return "-";
    }
    return str;
  };

  const phoneStr = cleanValue(apiDetail?.phone);
  const emailStr = cleanValue(apiDetail?.email);
  const websiteStr = cleanValue(apiDetail?.website);

  const cityStr = cleanValue(apiDetail?.city);
  const provinceStr = cleanValue(apiDetail?.province);
  const locationStr =
    cityStr !== "-"
      ? `${cityStr}${provinceStr !== "-" ? `, ${provinceStr}` : ""}`
      : "-";

  // Address resolution: resolve true street address (ignoring duplicate business name)
  const addressStr = (() => {
    const bizName = (apiDetail?.name || "").trim().toLowerCase();
    const meta = apiDetail?.externalMetadata || (apiDetail as any)?.external_metadata || {};

    const clean = (s?: any) => {
      if (s === null || s === undefined || s === "-" || s === "null" || s === "undefined") return "";
      let res = String(s).trim();
      if (bizName && res.toLowerCase().startsWith(bizName)) {
        res = res.substring(bizName.length).replace(/^[\s,:-]+/, "").trim();
      }
      return res;
    };

    const street = clean(meta.street);
    const housenumber = clean(meta.housenumber);
    const line2 = clean(meta.address_line2);
    const formatted = clean(meta.formatted);
    const line1 = clean(meta.address_line1);
    const suburb = clean(meta.suburb || meta.village || meta.city_block || meta.district);
    const rawAddr = clean(apiDetail?.address);

    if (street) {
      let constructed = street;
      if (housenumber) constructed = `${street} No. ${housenumber}`;
      if (suburb && !street.toLowerCase().includes(suburb.toLowerCase())) {
        constructed = `${constructed}, ${suburb}`;
      }
      return constructed;
    }

    if (line2) return line2;
    if (formatted) return formatted;
    if (line1) return line1;
    if (rawAddr) return rawAddr;

    return "-";
  })();

  const postalCodeStr = cleanValue(apiDetail?.postalCode ?? (apiDetail as any)?.postal_code);

  const fullAddress = (() => {
    const parts: string[] = [];
    if (addressStr && addressStr !== "-") parts.push(addressStr);
    if (cityStr && cityStr !== "-" && !parts.some((p) => p.toLowerCase().includes(cityStr.toLowerCase()))) {
      parts.push(cityStr);
    }
    if (provinceStr && provinceStr !== "-" && !parts.some((p) => p.toLowerCase().includes(provinceStr.toLowerCase()))) {
      parts.push(provinceStr);
    }
    if (postalCodeStr && postalCodeStr !== "-" && !parts.some((p) => p.toLowerCase().includes(postalCodeStr.toLowerCase()))) {
      parts.push(postalCodeStr);
    }
    return parts.length > 0 ? parts.join(", ") : "-";
  })();

  const displayLocation = locationStr !== "-" ? locationStr : addressStr;

  // Logo & cover: prefer camelCase (real API) > snake_case (legacy)
  const rawLogo = apiDetail?.logoUrl ?? apiDetail?.logo_url ?? null;
  const rawCover = apiDetail?.coverUrl ?? apiDetail?.cover_url ?? null;
  const logoUrl = rawLogo ? resolveMediaUrl(rawLogo) : null;
  const coverUrl = rawCover ? resolveMediaUrl(rawCover) : null;

  const openingHoursRaw = cleanValue(
    (apiDetail as any)?.opening_hours ??
    (apiDetail as any)?.openingHours ??
    (apiDetail as any)?.externalMetadata?.opening_hours ??
    (apiDetail as any)?.external_metadata?.opening_hours
  );
  const establishedYearRaw =
    (apiDetail as any)?.established_year ??
    (apiDetail as any)?.establishedYear ??
    (apiDetail as any)?.founded_year ??
    (apiDetail as any)?.foundedYear ??
    null;
  const establishedYear = establishedYearRaw ? Number(establishedYearRaw) : null;
  const experienceYears = establishedYear ? Math.max(1, new Date().getFullYear() - establishedYear) : null;

  const renderCategoryIcon = (category: string) => {
    const c = (category || "").toLowerCase();
    if (c.includes("barber") || c.includes("cukur") || c.includes("pangkas") || c.includes("salon") || c.includes("hair")) {
      return <Scissors className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("kuliner") || c.includes("resto") || c.includes("makan") || c.includes("cafe") || c.includes("kopi") || c.includes("food")) {
      return <Utensils className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("hotel") || c.includes("kost") || c.includes("apart") || c.includes("penginapan") || c.includes("properti")) {
      return <Building2 className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("mobil") || c.includes("motor") || c.includes("rent") || c.includes("otomotif") || c.includes("bengkel") || c.includes("car")) {
      return <Car className="w-3.5 h-3.5 text-[#008767]" />;
    }
    if (c.includes("sehat") || c.includes("medis") || c.includes("klinik") || c.includes("dokter") || c.includes("apotek") || c.includes("health")) {
      return <HeartPulse className="w-3.5 h-3.5 text-[#008767]" />;
    }
    return <Store className="w-3.5 h-3.5 text-[#008767]" />;
  };

  // Owner-written facilities description & list (set from the claiming owner's dashboard).
  const facilitiesList = resolveFacilitiesList(apiDetail);
  const facilitiesDescription = resolveFacilitiesDescription(apiDetail);
  const hasFacilities = facilitiesList.length > 0 || Boolean(facilitiesDescription);
  const socialLinks = resolveSocialLinks(apiDetail?.socialMedia ?? (apiDetail as any)?.social_media);

  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://katamereka.id/business/${slug}`;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-[#008767] font-semibold text-sm">
            <div className="w-5 h-5 border-2 border-[#008767] border-t-transparent rounded-full animate-spin" />
            <span>Memuat profil bisnis...</span>
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 px-4 text-center">
          <h1 className="text-xl font-bold text-slate-800">Bisnis tidak ditemukan</h1>
          <p className="text-sm text-slate-500 max-w-sm">
            Profil bisnis untuk tautan ini tidak tersedia. Mungkin sudah dihapus atau alamatnya salah.
          </p>
          <Link
            href="/businesses"
            className="px-5 py-2.5 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-sm font-semibold transition-colors"
          >
            Jelajahi Bisnis Lain
          </Link>
        </div>
      </div>
    );
  }

  if (isBusinessDomain && apiDetail) {
    return (
      <BusinessTrustScoreView
        business={apiDetail}
        actualRating={actualRating}
        actualReviewCount={actualReviewCount}
        placeImageUrl={placeImageUrl}
        claimStatus={claimStatus}
        isBusinessMember={isBusinessMember}
        claimModalOpen={claimModalOpen}
        setClaimModalOpen={setClaimModalOpen}
        claimForm={claimForm}
        setClaimForm={setClaimForm as any}
        onSubmitClaim={handleSubmitClaim}
        claimSubmitting={claimSubmitting}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans">
      <Navbar />

      {/* ================= BREADCRUMBS ================= */}
      <div className="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-[#008767] transition-colors">
            Beranda
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link href="/businesses" className="hover:text-[#008767] transition-colors">
            Kategori
          </Link>
          <span className="text-slate-400">&gt;</span>
          <Link
            href={`/kategori/${slugify(formattedCategory)}`}
            className="hover:text-[#008767] transition-colors"
          >
            {formattedCategory}
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-700 font-semibold truncate max-w-xs sm:max-w-md">
            {apiDetail?.name || "-"}
          </span>
        </nav>
      </div>

      {/* ================= TOP COVER BANNER & OVERLAPPING PROFILE CARD ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-0 pb-4">
        {/* Landscape Cover Banner */}
        <div
          onClick={() => {
            const targetImg = coverUrl || placeImageUrl || logoUrl;
            if (targetImg) setPreviewPhotoModalUrl(targetImg);
          }}
          className="w-full h-56 sm:h-72 md:h-80 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200/80 bg-slate-100 group cursor-pointer"
        >
          {coverUrl || placeImageUrl || logoUrl ? (
            <>
              <img
                src={coverUrl || placeImageUrl || logoUrl || ""}
                alt={apiDetail?.name || "Cover Bisnis"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const targetImg = coverUrl || placeImageUrl || logoUrl;
                    if (targetImg) setPreviewPhotoModalUrl(targetImg);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-lg backdrop-blur-md transition-transform transform hover:scale-105"
                >
                  <Eye className="w-4 h-4 text-[#008767]" />
                  <span>Lihat Foto</span>
                </button>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-emerald-100 via-[#e0f4ee] to-teal-100/70 flex items-center justify-center font-bold text-4xl text-[#008767]">
              {initials}
            </div>
          )}
        </div>

        {/* Overlapping Profile Card */}
        <div className="relative -mt-10 sm:-mt-16 mx-2 sm:mx-6 bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-md p-4 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-5">
            {/* Left: Avatar + Title + Category + Address */}
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0">
              <div
                onClick={() => {
                  const targetImg = logoUrl || coverUrl || placeImageUrl;
                  if (targetImg) setPreviewPhotoModalUrl(targetImg);
                }}
                className="w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl border-2 sm:border-4 border-white shadow-sm overflow-hidden bg-slate-100 flex-shrink-0 cursor-pointer relative group"
              >
                {logoUrl || coverUrl || placeImageUrl ? (
                  <img
                    src={logoUrl || coverUrl || placeImageUrl || ""}
                    alt={apiDetail?.name || "Logo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-[#008767] font-bold text-xl sm:text-2xl">
                    {initials}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                {/* Business Title + Verified Icon */}
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold text-[#0f172a] tracking-tight line-clamp-2 sm:truncate">
                    {apiDetail?.name || "-"}
                  </h1>
                  <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 fill-[#008767] text-white flex-shrink-0" />
                </div>

                {/* Location with Pin (Clickable to Google Maps) */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 min-w-0">
                  <img
                    src="/icons/header-location.png"
                    alt="Lokasi bisnis"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain flex-shrink-0"
                  />
                  {fullAddress !== "-" || locationStr !== "-" ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${apiDetail?.name ? `${apiDetail.name}, ` : ""}${fullAddress !== "-" ? fullAddress : locationStr}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate max-w-sm sm:max-w-md md:max-w-lg font-medium text-slate-600 hover:text-[#008767] hover:underline cursor-pointer"
                      title="Buka lokasi di Google Maps"
                    >
                      {fullAddress !== "-" ? fullAddress : (locationStr !== "-" ? locationStr : "Indonesia")}
                    </a>
                  ) : (
                    <span className="truncate max-w-sm sm:max-w-md md:max-w-lg">Indonesia</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto">
              <Link
                href={`/review?business=${slug}`}
                className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 h-10 sm:h-11 rounded-full text-xs sm:text-sm font-bold shadow-xs whitespace-nowrap transition-colors col-span-2 sm:col-auto text-center ${hasReviewed
                    ? "bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#008767]"
                    : "bg-[#008767] hover:bg-[#007458] text-white"
                  }`}
              >
                <Edit3 className="w-4 h-4 shrink-0" />
                <span>{hasReviewed ? "Edit Review" : "Tulis Review"}</span>
              </Link>

              <button
                type="button"
                onClick={handleToggleSave}
                disabled={savingFavorite}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 h-10 sm:h-11 rounded-full text-xs sm:text-sm font-semibold border whitespace-nowrap transition-colors w-full sm:w-auto sm:shrink-0 text-center ${isSaved
                  ? "bg-emerald-50 border-emerald-300 text-[#008767]"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <Bookmark
                  className={`w-4 h-4 shrink-0 ${isSaved ? "fill-[#008767] text-[#008767]" : "text-slate-600"}`}
                />
                <span>Favorit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({
                        title: apiDetail?.name,
                        url: shareUrl,
                      })
                      .catch(() => { });
                  } else if (navigator.clipboard) {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success("Tautan bisnis berhasil disalin!");
                  }
                }}
                className="w-full h-10 sm:w-11 sm:h-11 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 sm:shrink-0"
                title="Bagikan Profil Bisnis"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span className="sm:hidden text-xs font-semibold">Bagikan</span>
              </button>
            </div>
          </div>

          {/* Integrated Bottom Tabs */}
          <div className="mt-4 sm:mt-6 border-t border-slate-100 pt-1 sm:pt-2 -mb-2 sm:-mb-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <nav className="flex items-center justify-between sm:justify-start sm:gap-8 min-w-full">
              {[
                { id: "profil", label: "Profil" },
                { id: "review", label: `Review (${actualReviewCount})` },
                { id: "foto", label: "Foto" },
                { id: "info", label: "Info" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`relative py-3 sm:py-2.5 px-2 sm:px-1 flex-auto sm:flex-initial whitespace-nowrap text-center text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${isActive
                        ? "text-[#008767]"
                        : "text-slate-500 hover:text-slate-800"
                      }`}
                  >
                    <span className="block">{tab.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 sm:w-full h-[2.5px] bg-[#008767] rounded-full" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT (LEFT COLUMN + RIGHT SIDEBAR) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-6">

            {/* TAB PROFIL */}
            {activeTab === "profil" && (
              <>
                {/* Card 1: Tentang Bisnis (Collapsible Dropdown Accordion) */}
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setIsTentangOpen(!isTentangOpen)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                      Tentang {apiDetail?.name || "Bisnis Ini"}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform flex-shrink-0">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isTentangOpen ? "rotate-180 text-[#008767]" : ""
                          }`}
                      />
                    </div>
                  </button>

                  {isTentangOpen && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1 border-t border-slate-100 animate-in fade-in duration-200">
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                        {apiDetail?.description && apiDetail.description.trim() !== "" && apiDetail.description !== "-"
                          ? apiDetail.description
                          : "-"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card 2: Fasilitas */}
                {hasFacilities && (
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setIsFasilitasOpen(!isFasilitasOpen)}
                      className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                          Fasilitas
                        </h3>
                        {facilitiesList.length > 0 && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#008767] border border-emerald-200">
                            {facilitiesList.length}
                          </span>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 transition-transform flex-shrink-0">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${isFasilitasOpen ? "rotate-180 text-[#008767]" : ""
                            }`}
                        />
                      </div>
                    </button>

                    {isFasilitasOpen && (
                      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 border-t border-slate-100 space-y-3 animate-in fade-in duration-200">
                        {facilitiesList.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {facilitiesList.map((item, idx) => (
                              <div
                                key={idx}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium"
                              >
                                <span className="size-1.5 rounded-full bg-[#008767]" />
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {facilitiesDescription && (
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                            {facilitiesDescription}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Card 3: Ulasan Pelanggan */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-7 shadow-xs space-y-4 sm:space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                        Ulasan Pelanggan
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                          <span className="text-xs font-bold text-slate-800">
                            {actualReviewCount > 0 && actualRating > 0 ? ratingFormatted : "-"}
                          </span>
                        </div>
                        <span className="text-slate-300 text-xs">•</span>
                        <p className="text-xs text-slate-500">
                          {reviewCountFormatted}
                        </p>
                      </div>
                    </div>
                    {businessReviews.length > 0 && (
                      <Link
                        href={`/business/${slug}/reviews`}
                        className="text-xs font-semibold text-[#008767] hover:underline"
                      >
                        Lihat semua →
                      </Link>
                    )}
                  </div>

                  {loadingReviews ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}
                    </div>
                  ) : businessReviews.length > 0 ? (
                    <div className="space-y-4">
                      {businessReviews.slice(0, 3).map((rev) => (
                        <ReviewCard
                          key={rev.id}
                          review={rev}
                          businessSlug={slug}
                          currentUserId={user?.id}
                          isInitiallyHelpful={myHelpfulVoteIds.has(rev.id)}
                          onDelete={(id) => setConfirmDeleteId(id)}
                          isDeleting={deletingReviewId === rev.id}
                        />
                      ))}
                      {actualReviewCount > 3 && (
                        <Link
                          href={`/business/${slug}/reviews`}
                          className="block text-center w-full py-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:border-[#008767] hover:text-[#008767] transition-colors"
                        >
                          Lihat {actualReviewCount - 3} ulasan lainnya →
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="py-10 text-center space-y-3.5">
                      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-[#008767]">
                        <MessageSquare className="w-7 h-7 text-[#008767]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                          Belum ada ulasan dari pengguna
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Jadilah yang pertama memberikan ulasan untuk {apiDetail?.name || "bisnis ini"}.
                        </p>
                      </div>
                      <div className="pt-1">
                        <Link
                          href={`/review?business=${slug}`}
                          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs sm:text-sm font-bold shadow-xs whitespace-nowrap transition-colors"
                        >
                          <Edit3 className="w-4 h-4 shrink-0" />
                          <span>{hasReviewed ? "Edit Ulasan Saya" : "Tulis Ulasan Sekarang"}</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TAB REVIEW */}
            {activeTab === "review" && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-xl">
                      Semua Ulasan Pelanggan
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-800">
                          {actualReviewCount > 0 && actualRating > 0 ? ratingFormatted : "-"}
                        </span>
                      </div>
                      <span className="text-slate-300 text-xs">•</span>
                      <p className="text-xs text-slate-500">{reviewCountFormatted}</p>
                    </div>
                  </div>
                  <Link
                    href={`/review?business=${slug}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#008767] hover:bg-[#007458] text-white text-xs font-semibold self-start sm:self-auto transition-colors whitespace-nowrap shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span>{hasReviewed ? "Edit Ulasan" : "Tulis Ulasan"}</span>
                  </Link>
                </div>

                {loadingReviews ? (
                  <div className="space-y-3 animate-pulse">
                    {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
                  </div>
                ) : businessReviews.length > 0 ? (
                  <div className="space-y-4">
                    {businessReviews.map((rev) => (
                      <ReviewCard
                        key={rev.id}
                        review={rev}
                        businessSlug={slug}
                        currentUserId={user?.id}
                        isInitiallyHelpful={myHelpfulVoteIds.has(rev.id)}
                        onDelete={(id) => setConfirmDeleteId(id)}
                        isDeleting={deletingReviewId === rev.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm">Belum ada ulasan terdaftar</h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Berikan pendapat dan pengalaman Anda untuk membantu calon pengunjung lainnya.
                    </p>
                    <Link
                      href={`/review?business=${slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008767] text-white text-xs font-semibold shadow-xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Tulis Ulasan Sekarang</span>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB FOTO */}
            {activeTab === "foto" && (() => {
              const allPhotos = Array.from(
                new Set(
                  [
                    ...(Array.isArray(apiDetail?.photos) ? apiDetail.photos.map((p) => resolveMediaUrl(p)) : []),
                    coverUrl,
                    placeImageUrl,
                    logoUrl,
                  ].filter((p): p is string => Boolean(p && typeof p === "string" && p.trim() !== ""))
                )
              );

              return (
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base sm:text-xl">
                      Galeri Foto {apiDetail?.name || "-"}
                    </h3>
                  </div>
                  {allPhotos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {allPhotos.map((photo, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewPhotoModalUrl(photo)}
                          className="aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group relative shadow-2xs cursor-pointer"
                        >
                          <img
                            src={photo}
                            alt={`${apiDetail?.name} foto ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-900 text-xs font-bold shadow-md">
                              <Eye className="w-3.5 h-3.5 text-[#008767]" />
                              <span>Lihat Foto</span>
                            </span>
                          </div>
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-xs rounded-lg text-white text-[10px] font-medium">
                            Foto {idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Belum ada foto galeri</h4>
                      <p className="text-xs text-slate-500">
                        Dokumentasi foto tempat belum tersedia.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB INFO */}
            {activeTab === "info" && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
                <h3 className="font-bold text-slate-900 text-base sm:text-xl">
                  Informasi Lengkap {apiDetail?.name || "-"}
                </h3>
                <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                  <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 sm:space-y-4 text-xs sm:text-sm">
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/header-location.png"
                        alt="Alamat Lengkap"
                        className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Alamat Lengkap:</p>
                        {addressStr !== "-" ? (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${apiDetail?.name ? `${apiDetail.name}, ` : ""}${fullAddress !== "-" ? fullAddress : addressStr}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-[#008767] hover:underline mt-0.5 inline-block cursor-pointer"
                            title="Buka lokasi di Google Maps"
                          >
                            {addressStr}
                          </a>
                        ) : (
                          <p className="text-slate-600 mt-0.5">-</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Kota / Kabupaten:</p>
                        <p className="text-slate-600 mt-0.5">{cityStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Map className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Provinsi:</p>
                        <p className="text-slate-600 mt-0.5">{provinceStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/header-phone.png"
                        alt="Nomor Telepon"
                        className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Nomor Telepon / Kontak:</p>
                        <p className="text-slate-600 mt-0.5">{phoneStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#008767] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900">Email:</p>
                        <p className="text-slate-600 mt-0.5">{emailStr}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <img
                        src="/icons/header-website.png"
                        alt="Website"
                        className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <p className="font-bold text-slate-900">Website:</p>
                        <p className="text-slate-600 mt-0.5">{websiteStr}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ================= RIGHT SIDEBAR ================= */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">

            {/* CARD 1: Rating & Ulasan (Hidden on mobile) */}
            <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <MessageSquare className="w-4 h-4 text-[#008767]" />
                <span>Rating & Ulasan</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 fill-amber-400 text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-none">
                    {actualReviewCount > 0 && actualRating > 0 ? ratingFormatted : "-"}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    {actualReviewCount > 0 ? `Berdasarkan ${reviewCountFormatted}` : "Belum ada ulasan"}
                  </p>
                </div>
              </div>
            </div>

            {/* CARD 2: Informasi Lainnya */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <Store className="w-4 h-4 text-[#008767]" />
                <span>Informasi Lainnya</span>
              </div>

              <div className="space-y-3">
                {/* Phone */}
                <div className="flex items-center gap-3 text-slate-700 min-w-0">
                  <img
                    src="/icons/header-phone.png"
                    alt="Telepon"
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
                  {phoneStr !== "-" ? (
                    <a
                      href={`tel:${phoneStr}`}
                      className="truncate font-medium text-slate-800 hover:text-[#008767] hover:underline"
                    >
                      {phoneStr}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">-</span>
                  )}
                </div>

                {/* Website */}
                <div className="flex items-center gap-3 text-slate-700 min-w-0">
                  <img
                    src="/icons/header-website.png"
                    alt="Website"
                    className="w-4 h-4 object-contain flex-shrink-0"
                  />
                  {websiteStr !== "-" ? (
                    <a
                      href={websiteStr.startsWith("http") ? websiteStr : `https://${websiteStr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-medium text-[#008767] hover:underline"
                    >
                      {websiteStr}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">-</span>
                  )}
                </div>

                {/* Address (Clickable Google Maps link) */}
                <div className="flex items-start gap-3 text-slate-700 min-w-0">
                  <img
                    src="/icons/header-location.png"
                    alt="Alamat"
                    className="w-4 h-4 object-contain flex-shrink-0 mt-0.5"
                  />
                  {fullAddress !== "-" || locationStr !== "-" ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${apiDetail?.name ? `${apiDetail.name}, ` : ""}${fullAddress !== "-" ? fullAddress : locationStr}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leading-snug font-medium text-slate-800 hover:text-[#008767] hover:underline cursor-pointer"
                      title="Buka lokasi di Google Maps"
                    >
                      {fullAddress !== "-" ? fullAddress : (locationStr !== "-" ? locationStr : "-")}
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 2b: Media Sosial (hidden until the owner adds at least one link) */}
            {socialLinks.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs text-xs sm:text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-slate-900 font-bold text-sm sm:text-base">Media Sosial</span>
                  <div className="flex items-center gap-2.5">
                    {socialLinks.map(({ platform, label, url }) => {
                      const { bg, Icon } = SOCIAL_STYLES[platform];
                      return (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          aria-label={`${label} ${apiDetail?.name ?? ""}`.trim()}
                          title={label}
                          className={`${bg} w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm hover:scale-110 hover:shadow-md transition-all`}
                        >
                          <Icon />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* CARD 3: Jam Operasional (List hari dengan data -) */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                <img
                  src="/icons/header-clock.png"
                  alt="Jam Operasional"
                  className="w-5 h-5 object-contain flex-shrink-0"
                />
                <span>Jam Operasional</span>
              </div>

              {(() => {
                const daysOfWeek = [
                  { name: "Senin", dayIdx: 1 },
                  { name: "Selasa", dayIdx: 2 },
                  { name: "Rabu", dayIdx: 3 },
                  { name: "Kamis", dayIdx: 4 },
                  { name: "Jumat", dayIdx: 5 },
                  { name: "Sabtu", dayIdx: 6 },
                  { name: "Minggu", dayIdx: 0 },
                ];
                const currentDayIdx = new Date().getDay();

                return (
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    {daysOfWeek.map((day) => {
                      const isToday = day.dayIdx === currentDayIdx;
                      return (
                        <div
                          key={day.name}
                          className={`flex items-center justify-between py-1 px-2 rounded-lg transition-colors ${isToday
                            ? "bg-emerald-50/70 font-bold text-slate-900"
                            : "text-slate-600"
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{day.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800">-</span>
                            {isToday && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008767] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#008767]" />
                                Hari ini
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* CARD 4: Apakah Anda pemilik bisnis ini? */}
            {isBusinessMember ? (
              <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <LayoutDashboard className="w-5 h-5 text-[#008767]" />
                  <span>Dashboard Akun Bisnis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil toko dan balas review pelanggan Anda.
                </p>
                <Link
                  href="/dashboard"
                  className="block w-full text-center py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs font-bold shadow-xs transition-all"
                >
                  Buka Dashboard
                </Link>
              </div>
            ) : claimStatus === "PENDING" ? (
              <div className="bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 rounded-2xl sm:rounded-3xl border border-amber-200 p-4 sm:p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-700" />
                  <span>Klaim Sedang Ditinjau</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pengajuan klaim Anda untuk bisnis ini sedang diperiksa oleh tim admin Katamereka.
                </p>
              </div>
            ) : isClaimedByOwner ? (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Bisnis Terverifikasi</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {apiDetail?.owner_name
                    ? `Bisnis ini sudah diklaim dan diverifikasi oleh ${apiDetail.owner_name}`
                    : "Bisnis ini sudah diklaim dan dikelola oleh pemilik terverifikasi"}
                  {claimedSinceLabel ? ` sejak ${claimedSinceLabel}.` : "."}
                </p>
              </div>
            ) : !mounted || !isLoggedIn ? (
              <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Apakah Anda pemilik bisnis ini?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil bisnis Anda, balas review, dan jangkau lebih banyak pelanggan.
                </p>
                <Link
                  href={`/login?redirect=${encodeURIComponent(`/business/${slug}`)}`}
                  suppressHydrationWarning
                  className="block w-full text-center py-3 rounded-full bg-[#008767] hover:bg-[#007458] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
                >
                  Klaim Bisnis Ini
                </Link>
              </div>
            ) : (
              <div className="bg-[#f0faf7] border border-[#008767]/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-[#008767]" />
                  <span>Apakah Anda pemilik bisnis ini?</span>
                </div>
                {claimStatus === "REJECTED" && (
                  <p className="text-xs text-red-600 leading-relaxed">
                    Klaim sebelumnya ditolak. Anda bisa mengajukan klaim ulang dengan bukti kepemilikan yang lebih lengkap.
                  </p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kelola profil bisnis Anda, balas review, dan jangkau lebih banyak pelanggan.
                </p>
                <button
                  type="button"
                  disabled={claimStatusLoading || !apiDetail?.id}
                  onClick={() => setClaimModalOpen(true)}
                  className="block w-full text-center py-3 rounded-full bg-[#008767] hover:bg-[#007458] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  {claimStatusLoading
                    ? "Memeriksa status..."
                    : claimStatus === "REJECTED"
                      ? "Ajukan Klaim Ulang"
                      : "Klaim Bisnis Ini"}
                </button>
              </div>
            )}

            <Dialog
              open={claimModalOpen}
              onOpenChange={(open) => {
                setClaimModalOpen(open);
                if (!open) {
                  setRoleDropdownOpen(false);
                  setMethodDropdownOpen(false);
                }
              }}
            >
              <DialogContent
                showCloseButton={false}
                className="fixed bottom-0 top-auto left-0 translate-x-0 translate-y-0 w-full max-w-full rounded-t-[28px] rounded-b-none border-b-0 border-x-0 max-h-[90vh] sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[calc(100%-2rem)] sm:max-w-xl sm:rounded-3xl sm:border p-0 flex flex-col overflow-hidden shadow-2xl bg-white gap-0"
              >
                {/* STICKY HEADER */}
                <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-5 sm:px-6 pt-3 pb-3 sm:py-4 flex flex-col shrink-0">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-2.5 sm:hidden shrink-0" />
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="p-2 sm:p-2.5 rounded-2xl bg-emerald-50 text-[#008767] border border-emerald-100 shrink-0">
                        <ShieldCheck className="w-5 h-5 text-[#008767]" />
                      </span>
                      <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 truncate">
                        Klaim Kepemilikan Bisnis
                      </DialogTitle>
                    </div>
                    <button
                      type="button"
                      onClick={() => setClaimModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0 cursor-pointer"
                      aria-label="Tutup"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* SCROLLABLE BODY */}
                <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
                  {/* CARD 1: DATA TERHUBUNG OTOMATIS */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <Check className="w-3.5 h-3.5 text-[#008767] shrink-0" />
                      <span className="whitespace-nowrap">Data Terisi Otomatis dari Sistem</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Nama Bisnis</span>
                        <span className="font-semibold text-slate-900">{apiDetail?.name || "-"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Kategori</span>
                        <span className="font-medium text-slate-800">{apiDetail?.category || "Bisnis Umum"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Akun Pemohon</span>
                        <span className="font-semibold text-slate-900">{user?.name || "Pengguna"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Email Terdaftar</span>
                        <span className="font-medium text-slate-800">{user?.email || "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* ROW: JABATAN & METODE VERIFIKASI (BERSEBELAHAN 1 ROW) */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 items-start">
                    {/* FIELD 1: JABATAN DI BISNIS */}
                    <div className="space-y-1.5">
                      <Label htmlFor="claim-role" className="text-xs font-bold text-slate-800">
                        Jabatan di Bisnis <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <button
                          id="claim-role"
                          type="button"
                          onClick={() => {
                            setRoleDropdownOpen(!roleDropdownOpen);
                            setMethodDropdownOpen(false);
                          }}
                          className={`w-full h-11 px-3 sm:px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all bg-white cursor-pointer ${
                            roleDropdownOpen
                              ? "border-[#008767] ring-2 ring-[#008767]/20 text-[#008767]"
                              : "border-slate-200 hover:border-[#008767]/60 text-slate-800"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate min-w-0">
                            <UserCheck className="w-4 h-4 text-[#008767] shrink-0" />
                            <span className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                              {claimForm.role === "Owner" && "Owner (Pemilik)"}
                              {claimForm.role === "Manager" && "Manager (Pengelola)"}
                              {claimForm.role === "Admin" && "Admin (Administrator)"}
                              {claimForm.role === "Staff" && "Staff (Karyawan)"}
                              {claimForm.role === "Lainnya" && (claimForm.custom_role ? `Lainnya: ${claimForm.custom_role}` : "Lainnya...")}
                            </span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${
                              roleDropdownOpen ? "rotate-180 text-[#008767]" : ""
                            }`}
                          />
                        </button>

                        {roleDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setRoleDropdownOpen(false)}
                            />
                            <div className="absolute left-0 top-full mt-1.5 w-[250px] sm:w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                              {[
                                { value: "Owner", label: "Owner (Pemilik)", desc: "Pemilik resmi bisnis ini" },
                                { value: "Manager", label: "Manager (Pengelola)", desc: "Pimpinan / manajer operasional toko" },
                                { value: "Admin", label: "Admin (Administrator)", desc: "Pengelola akun digital atau kasir" },
                                { value: "Staff", label: "Staff (Karyawan)", desc: "Karyawan atau staf perwakilan resmi" },
                                { value: "Lainnya", label: "Lainnya...", desc: "Sebutkan jabatan atau posisi Anda lainnya" },
                              ].map((item) => {
                                const isSelected = claimForm.role === item.value;
                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                      setClaimForm((f) => ({ ...f, role: item.value as any }));
                                      setRoleDropdownOpen(false);
                                    }}
                                    className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between text-left transition-colors cursor-pointer ${
                                      isSelected
                                        ? "bg-emerald-50 text-[#008767] font-bold border border-emerald-200/60"
                                        : "hover:bg-slate-50 text-slate-700 hover:text-[#008767]"
                                    }`}
                                  >
                                    <div>
                                      <p className="font-semibold leading-tight">{item.label}</p>
                                      <p className={`text-[10px] mt-0.5 ${isSelected ? "text-[#008767]/80" : "text-slate-400"}`}>
                                        {item.desc}
                                      </p>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#008767] shrink-0 ml-2" />}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>

                      {claimForm.role === "Lainnya" && (
                        <Input
                          type="text"
                          placeholder="Sebutkan jabatan Anda"
                          value={claimForm.custom_role}
                          onChange={(e) => setClaimForm((f) => ({ ...f, custom_role: e.target.value }))}
                          className="mt-2 text-xs rounded-xl border-slate-200 h-10"
                        />
                      )}
                    </div>

                    {/* FIELD 2: METODE VERIFIKASI */}
                    <div className="space-y-1.5">
                      <Label htmlFor="claim-method" className="text-xs font-bold text-slate-800">
                        Metode Verifikasi <span className="text-rose-500">*</span>
                      </Label>
                      <div className="relative">
                        <button
                          id="claim-method"
                          type="button"
                          onClick={() => {
                            setMethodDropdownOpen(!methodDropdownOpen);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full h-11 px-3 sm:px-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center justify-between transition-all bg-white cursor-pointer ${
                            methodDropdownOpen
                              ? "border-[#008767] ring-2 ring-[#008767]/20 text-[#008767]"
                              : "border-slate-200 hover:border-[#008767]/60 text-slate-800"
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate min-w-0">
                            {claimForm.verification_method === "DOCUMENT" && <FileText className="w-4 h-4 text-[#008767] shrink-0" />}
                            {claimForm.verification_method === "WEBSITE" && <Globe className="w-4 h-4 text-[#008767] shrink-0" />}
                            {claimForm.verification_method === "EMAIL" && <Mail className="w-4 h-4 text-[#008767] shrink-0" />}
                            {claimForm.verification_method === "PHONE" && <Phone className="w-4 h-4 text-[#008767] shrink-0" />}
                            {claimForm.verification_method === "OTHER" && <ShieldCheck className="w-4 h-4 text-[#008767] shrink-0" />}
                            <span className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                              {claimForm.verification_method === "DOCUMENT" && "Dokumen Resmi"}
                              {claimForm.verification_method === "WEBSITE" && "Website Resmi"}
                              {claimForm.verification_method === "EMAIL" && "Email Bisnis"}
                              {claimForm.verification_method === "PHONE" && "Nomor Telepon"}
                              {claimForm.verification_method === "OTHER" && "Lainnya"}
                            </span>
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${
                              methodDropdownOpen ? "rotate-180 text-[#008767]" : ""
                            }`}
                          />
                        </button>

                        {methodDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setMethodDropdownOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-1.5 w-[260px] sm:w-full bg-white border border-slate-200/90 rounded-2xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                              {[
                                {
                                  value: "DOCUMENT",
                                  label: "Dokumen Resmi",
                                  desc: "NIB, SIUP, Surat Tugas, Izin Usaha",
                                  icon: FileText,
                                },
                                {
                                  value: "WEBSITE",
                                  label: "Website Resmi",
                                  desc: "Domain & kontak tertera di website",
                                  icon: Globe,
                                },
                                {
                                  value: "EMAIL",
                                  label: "Email Bisnis",
                                  desc: "Email berdomain perusahaan",
                                  icon: Mail,
                                },
                                {
                                  value: "PHONE",
                                  label: "Nomor Telepon",
                                  desc: "Nomor telepon operasional toko",
                                  icon: Phone,
                                },
                                {
                                  value: "OTHER",
                                  label: "Lainnya",
                                  desc: "Bukti pendukung / media sosial",
                                  icon: ShieldCheck,
                                },
                              ].map((item) => {
                                const isSelected = claimForm.verification_method === item.value;
                                const IconComp = item.icon;
                                return (
                                  <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                      setClaimForm((f) => ({
                                        ...f,
                                        verification_method: item.value as VerificationMethod,
                                        verification_proof: "",
                                        document_file: null,
                                        document_file_name: "",
                                      }));
                                      setMethodDropdownOpen(false);
                                    }}
                                    className={`w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between text-left transition-colors cursor-pointer ${
                                      isSelected
                                        ? "bg-emerald-50 text-[#008767] font-bold border border-emerald-200/60"
                                        : "hover:bg-slate-50 text-slate-700 hover:text-[#008767]"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <IconComp className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? "text-[#008767]" : "text-slate-400"}`} />
                                      <div>
                                        <p className="font-semibold leading-tight">{item.label}</p>
                                        <p className={`text-[10px] mt-0.5 ${isSelected ? "text-[#008767]/80" : "text-slate-400"}`}>
                                          {item.desc}
                                        </p>
                                      </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#008767] shrink-0 ml-2" />}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* FIELD 3: BUKTI VERIFIKASI SESUAI METODE */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100">
                    <Label className="text-xs font-bold text-slate-900 block">
                      Bukti Verifikasi <span className="text-rose-500">*</span>
                    </Label>

                    {/* METHOD = DOCUMENT */}
                    {claimForm.verification_method === "DOCUMENT" && (
                      <div className="space-y-2">
                        <input
                          type="file"
                          ref={claimFileInputRef}
                          accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 10 * 1024 * 1024) {
                                toast.error("Ukuran file melebihi 10MB");
                                return;
                              }
                              setClaimForm((f) => ({
                                ...f,
                                document_file: file,
                                document_file_name: file.name,
                              }));
                            }
                          }}
                        />

                        {claimForm.document_file_name ? (
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-800">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-[#008767] shrink-0" />
                              <span className="truncate font-medium">{claimForm.document_file_name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setClaimForm((f) => ({ ...f, document_file: null, document_file_name: "" }));
                                if (claimFileInputRef.current) claimFileInputRef.current.value = "";
                              }}
                              className="text-slate-400 hover:text-rose-600 text-xs px-2 py-0.5 rounded cursor-pointer"
                            >
                              Hapus
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={() => claimFileInputRef.current?.click()}
                              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed border-[#008767]/60 bg-white hover:bg-emerald-50 text-[#008767] text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <UploadCloud className="w-4 h-4" />
                              <span>Pilih File Dokumen (PDF / JPG / PNG, maks 10MB)</span>
                            </button>
                            <div className="text-[10px] text-slate-400 text-center font-medium">atau cantumkan link dokumen online di bawah</div>
                          </div>
                        )}

                        <Input
                          type="url"
                          placeholder="Link dokumen alternatif (opsional)..."
                          value={claimForm.verification_proof}
                          onChange={(e) => setClaimForm((f) => ({ ...f, verification_proof: e.target.value }))}
                          className="h-9 text-xs rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    )}

                    {/* METHOD = WEBSITE */}
                    {claimForm.verification_method === "WEBSITE" && (
                      <div className="space-y-1">
                        <Input
                          type="url"
                          placeholder="https://www.namabisnis.com"
                          value={claimForm.verification_proof}
                          onChange={(e) => setClaimForm((f) => ({ ...f, verification_proof: e.target.value }))}
                          className="h-10 text-xs rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    )}

                    {/* METHOD = EMAIL */}
                    {claimForm.verification_method === "EMAIL" && (
                      <div className="space-y-1">
                        <Input
                          type="email"
                          placeholder="owner@namabisnis.com"
                          value={claimForm.verification_proof}
                          onChange={(e) => setClaimForm((f) => ({ ...f, verification_proof: e.target.value }))}
                          className="h-10 text-xs rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    )}

                    {/* METHOD = PHONE */}
                    {claimForm.verification_method === "PHONE" && (
                      <div className="space-y-1">
                        <Input
                          type="tel"
                          inputMode="numeric"
                          placeholder="08123456789"
                          value={claimForm.verification_proof}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9-]/g, "");
                            setClaimForm((f) => ({ ...f, verification_proof: val }));
                          }}
                          className="h-10 text-xs rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    )}

                    {/* METHOD = OTHER */}
                    {claimForm.verification_method === "OTHER" && (
                      <div className="space-y-1">
                        <Input
                          type="text"
                          placeholder="Link bukti atau keterangan pendukung..."
                          value={claimForm.verification_proof}
                          onChange={(e) => setClaimForm((f) => ({ ...f, verification_proof: e.target.value }))}
                          className="h-10 text-xs rounded-xl bg-white border-slate-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* FIELD 4: NOMOR HP PENGAJU (OPSIONAL) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="claim-phone" className="text-xs font-bold text-slate-800">
                      Nomor HP Pengaju <span className="text-slate-400 font-normal">(opsional)</span>
                    </Label>
                    <Input
                      id="claim-phone"
                      type="tel"
                      inputMode="numeric"
                      placeholder="08123456789"
                      value={claimForm.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9-]/g, "");
                        setClaimForm((f) => ({ ...f, phone: val }));
                      }}
                      className="h-10 text-xs rounded-xl border-slate-200"
                    />
                  </div>

                  {/* FIELD 5: PESAN UNTUK TIM VERIFIKATOR (OPSIONAL) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="claim-message" className="text-xs font-bold text-slate-800">
                      Pesan untuk Tim Verifikator <span className="text-slate-400 font-normal">(opsional)</span>
                    </Label>
                    <Textarea
                      id="claim-message"
                      rows={3}
                      placeholder="Catatan tambahan (opsional)..."
                      value={claimForm.message}
                      onChange={(e) => setClaimForm((f) => ({ ...f, message: e.target.value }))}
                      className="text-xs rounded-xl border-slate-200 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* STICKY FOOTER */}
                <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-xs border-t border-slate-100 px-5 sm:px-6 py-3 sm:py-3.5 flex items-center justify-end gap-2.5 shrink-0">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setClaimModalOpen(false)}
                    className="rounded-xl text-xs h-9.5 px-4 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmitClaim}
                    disabled={claimSubmitting || claimDocumentUploading}
                    className="bg-[#008767] hover:bg-[#007458] text-white rounded-xl text-xs h-9.5 font-bold px-5 shadow-xs cursor-pointer"
                  >
                    {claimSubmitting || claimDocumentUploading ? "Mengirim Klaim..." : "Kirim Klaim Sekarang"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-6 space-y-4">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#008767] flex items-center justify-center text-white">
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                </div>
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  Kata<span className="text-[#008767]">mereka</span>
                </span>
              </Link>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Suara nyata, keputusan lebih baik. Platform ulasan terpercaya di Indonesia.
              </p>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Tautan Cepat</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/" className="hover:text-[#008767]">Beranda</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Jelajahi</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Kategori</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-500">
                <li><Link href="/businesses" className="hover:text-[#008767]">Hotel & Akomodasi</Link></li>
                <li><Link href="/businesses" className="hover:text-[#008767]">Restoran & Kuliner</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Katamereka. Semua hak dilindungi.</p>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-[#008767]"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>Kembali ke atas</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => confirmDeleteId && handleDeleteReview(confirmDeleteId)}
        isDeleting={Boolean(deletingReviewId)}
      />

      {/* Share Business Profile Modal */}
      <ShareBusinessModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        businessName={apiDetail?.name || "-"}
        shareUrl={shareUrl}
      />

      {/* Dialog Preview Foto Bisnis (Shadcn UI - Fit to Image Size) */}
      <Dialog
        open={Boolean(previewPhotoModalUrl)}
        onOpenChange={(open) => !open && setPreviewPhotoModalUrl(null)}
      >
        <DialogContent className="w-fit max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-3.5 sm:p-5 bg-white/98 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
          <DialogHeader className="px-1 pt-0.5 pb-2">
            <DialogTitle className="text-sm sm:text-base font-bold text-slate-900 truncate pr-6">
              {apiDetail?.name || "Foto Bisnis"}
            </DialogTitle>
          </DialogHeader>
          <div className="relative flex items-center justify-center rounded-xl sm:rounded-2xl overflow-hidden bg-black/5 mt-0.5">
            {previewPhotoModalUrl && (
              <img
                src={previewPhotoModalUrl}
                alt={apiDetail?.name || "Foto Bisnis"}
                className="w-auto h-auto max-w-full max-h-[65vh] sm:max-h-[72vh] object-contain rounded-xl shadow-xs"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── ReviewCard component ─────────────────────────────────────────────────────
interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string;
    content: string;
    status?: string;
    createdAt?: string;
    created_at?: string;
    user?: { id?: string; name?: string; initials?: string };
    userId?: string;
    helpfulCount?: number;
    helpful_count?: number;
    photos?: string[];
    business_reply?: {
      id?: string;
      content?: string;
      reply?: string;
      created_at?: string;
      author?: { id?: string; name?: string } | null;
    } | null;
    reply?: {
      id?: string;
      content?: string;
      reply?: string;
      created_at?: string;
      author?: { id?: string; name?: string } | null;
    } | string | null;
  };
  businessSlug?: string;
  currentUserId?: string;
  isInitiallyHelpful?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

function ReviewCard({ review, businessSlug, currentUserId, isInitiallyHelpful, onDelete, isDeleting }: ReviewCardProps) {
  const rating = typeof review.rating === "number" ? review.rating : parseFloat(String(review.rating ?? 0));
  const safeRating = isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating));
  const initials = review.user?.initials || review.user?.name?.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase() || "U";
  const displayName = review.user?.name || "Pengguna";
  const userAvatar = (review.user as any)?.avatar_url || (review.user as any)?.avatarUrl || null;
  const userReviewsCount = (review.user as any)?.reviews_count ?? (review.user as any)?.reviewsCount ?? 1;
  const userPhotosCount = (review.user as any)?.photos_count ?? (review.user as any)?.photosCount ?? 0;
  const isOwnReview = Boolean(currentUserId && (review.user?.id === currentUserId || review.userId === currentUserId));

  const [isHelpful, setIsHelpful] = useState<boolean>(Boolean(isInitiallyHelpful));
  const initialHelpfulCount = review.helpfulCount ?? (review as any).helpful_count ?? 0;
  const [helpfulCount, setHelpfulCount] = useState<number>(initialHelpfulCount);
  const [helpfulLoading, setHelpfulLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  useEffect(() => {
    setHelpfulCount(review.helpfulCount ?? (review as any).helpful_count ?? 0);
  }, [review.id, review.helpfulCount, (review as any).helpful_count]);

  useEffect(() => {
    if (isInitiallyHelpful !== undefined) {
      setIsHelpful(Boolean(isInitiallyHelpful));
    }
  }, [isInitiallyHelpful]);

  const toggleHelpful = async () => {
    if (helpfulLoading) return;
    if (!currentUserId) {
      setShowLoginModal(true);
      return;
    }
    if (isOwnReview) {
      toast.error("Anda tidak dapat menandai ulasan milik sendiri");
      return;
    }

    const nextState = !isHelpful;
    setIsHelpful(nextState);
    setHelpfulCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));
    setHelpfulLoading(true);

    try {
      const res = await toggleReviewHelpful(review.id);
      if (res && res.success) {
        if (typeof res.isHelpful === "boolean") setIsHelpful(res.isHelpful);
        else if (typeof res.is_helpful === "boolean") setIsHelpful(res.is_helpful);
        if (typeof res.helpfulCount === "number") setHelpfulCount(res.helpfulCount);
        else if (typeof res.helpful_count === "number") setHelpfulCount(res.helpful_count);
        toast.success(res.message || (nextState ? "Ulasan ditandai bermanfaat" : "Batal menandai bermanfaat"));
      } else {
        // Rollback
        setIsHelpful(!nextState);
        setHelpfulCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
        toast.error(res?.message || "Gagal memperbarui vote helpful");
      }
    } catch {
      // Rollback
      setIsHelpful(!nextState);
      setHelpfulCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
      toast.error("Terjadi kesalahan saat memproses vote");
    } finally {
      setHelpfulLoading(false);
    }
  };

  function relativeDate(dateStr?: string) {
    if (!dateStr) return "Baru saja";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Baru saja";
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDay = Math.floor(diffHour / 24);
      if (diffSec < 60) return "Baru saja";
      if (diffMin < 60) return `${diffMin} menit lalu`;
      if (diffHour < 24) return `${diffHour} jam lalu`;
      if (diffDay < 7) return `${diffDay} hari lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return "Baru saja";
    }
  }

  const dateValue = review.createdAt || (review as any).created_at || (review as any).createdAt;

  return (
    <div className="bg-slate-50/60 rounded-xl sm:rounded-2xl border border-slate-200/80 p-3.5 sm:p-5 space-y-3 hover:border-[#008767]/30 transition-colors">
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* User avatar (Google profile avatar or initials fallback) */}
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={displayName}
            referrerPolicy="no-referrer"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 shadow-xs border border-slate-200"
          />
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#008767] text-white flex-shrink-0 flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 text-sm truncate" title={displayName}>
              {displayName}
            </p>
            {/* Rating Stars (5.0 text hidden on mobile, shown on larger screens) */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < safeRating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"
                  }`}
                />
              ))}
              <span className="hidden sm:inline text-xs font-bold text-slate-700 ml-1">
                {safeRating.toFixed(1)}
              </span>
            </div>
          </div>
          {/* Reviewer stats ala Google Maps: X ulasan · Y foto · waktu */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5 flex-wrap">
            <span>{userReviewsCount} ulasan</span>
            {userPhotosCount > 0 && (
              <>
                <span className="text-slate-300">·</span>
                <span>{userPhotosCount} foto</span>
              </>
            )}
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">{relativeDate(dateValue)}</span>
          </div>
        </div>
      </div>

      {/* Review body */}
      {review.title && (
        <p className="font-semibold text-slate-800 text-sm break-words">"{review.title}"</p>
      )}
      {review.content && (
        <p className="text-sm text-slate-600 leading-relaxed break-words">{review.content}</p>
      )}

      {/* Review photos */}
      {Array.isArray(review.photos) && review.photos.length > 0 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {review.photos.map((photo: string, idx: number) => (
            <a
              key={idx}
              href={resolveMediaUrl(photo)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group rounded-xl overflow-hidden w-16 h-16 sm:w-20 sm:h-20 border border-slate-200 block shadow-2xs hover:border-[#008767] transition-all"
            >
              <img
                src={resolveMediaUrl(photo)}
                alt={`Foto ulasan ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </a>
          ))}
        </div>
      )}

      {/* Business Reply Box if any */}
      {(review.business_reply || review.reply) && (
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-1.5 mt-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#008767]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Respon dari Pemilik Bisnis</span>
            </div>
            {(review.business_reply?.created_at || (typeof review.reply === "object" && review.reply?.created_at)) && (
              <span className="text-[11px] font-normal text-slate-400">
                {relativeDate(review.business_reply?.created_at || (typeof review.reply === "object" ? review.reply?.created_at : undefined))}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
            {review.business_reply?.content ||
              review.business_reply?.reply ||
              (typeof review.reply === "object" ? review.reply?.content || review.reply?.reply : review.reply) ||
              ""}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Helpful Button UI */}
          <button
            type="button"
            onClick={toggleHelpful}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer ${isHelpful
              ? "bg-emerald-50 text-[#008767] border-emerald-200"
              : "bg-white text-slate-600 border-slate-200/80 hover:border-[#008767]/40 hover:text-[#008767]"
              }`}
            title="Tandai ulasan ini bermanfaat"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isHelpful ? "fill-[#008767]" : ""}`} />
            <span>Helpful</span>
            {helpfulCount > 0 && <span className="font-bold">({helpfulCount})</span>}
          </button>

          {review.status === "APPROVED" ? (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Terverifikasi
            </span>
          ) : review.status === "PENDING" ? (
            <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Menunggu Review
            </span>
          ) : null}
        </div>

        {isOwnReview && (
          <div className="flex items-center gap-2">
            {businessSlug && (
              <Link
                href={`/review?business=${businessSlug}`}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[#008767] hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-colors text-xs font-medium cursor-pointer"
                title="Edit Ulasan Saya"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(review.id)}
                disabled={isDeleting}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors text-xs font-medium cursor-pointer"
                title="Hapus Ulasan Saya"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            )}
          </div>
        )}
      </div>

      <LoginDialog
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        title="Masuk untuk Menandai Ulasan"
        description="Silakan masuk dengan akun Google untuk menandai ulasan ini bermanfaat."
      />
    </div>
  );
}

// ─── Delete Confirmation Modal Dialog ─────────────────────────────────────────
interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  description?: string;
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  title = "Hapus Ulasan Ini?",
  description = "Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan dan ulasan akan dihapus secara permanen.",
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
          <Trash2 className="w-8 h-8" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
