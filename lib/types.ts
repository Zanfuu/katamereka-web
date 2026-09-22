// Shared domain types for KataMereka's Business Admin (/admin) and Super Admin
// (/super-admin) dashboards. Mirrors the data shape a future API would return —
// keep this in sync with lib/mock/* which is the only place that currently
// implements it.

export type PlatformRole = "USER" | "SUPER_ADMIN"

export type BusinessRole = "OWNER" | "ADMIN" | "MEMBER"

export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED"

export type AdminStatus = "ACTIVE" | "PENDING" | "SUSPENDED"

export type BusinessStatus = "ACTIVE" | "SUSPENDED"

export type VerificationStatus = "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED"

export type ReviewStatus = "PUBLISHED" | "HIDDEN" | "REMOVED"

export type ModerationStatus =
  | "PENDING_REVIEW"
  | "UNDER_INVESTIGATION"
  | "KEPT"
  | "HIDDEN"
  | "REMOVED"

export type ReportStatus = "OPEN" | "UNDER_INVESTIGATION" | "RESOLVED"

export type InvitationStatus = "SENT" | "OPENED" | "COMPLETED" | "EXPIRED"

export type InvitationChannel = "EMAIL" | "WHATSAPP" | "LINK" | "QR_CODE"

export type TeamMemberStatus = "ACTIVE" | "PENDING"

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  platformRole: PlatformRole
  status: UserStatus
  reviewCount: number
  joinedAt: string
  lastActiveAt: string
}

export interface Business {
  id: string
  name: string
  slug: string
  description: string
  category: string
  website?: string
  phone?: string
  email?: string
  logo?: string
  cover?: string
  address: string
  city: string
  province: string
  socialLinks?: { platform: string; url: string }[]
  operatingHours?: { day: string; hours: string }[]
  ownerId: string
  ownerName: string
  averageRating: number
  totalReviews: number
  verifiedReviews: number
  responseRate: number
  verificationStatus: VerificationStatus
  status: BusinessStatus
  createdAt: string
}

export interface Location {
  id: string
  businessId: string
  name: string
  city: string
  province: string
  address: string
  reviewCount: number
  averageRating: number
  status: "ACTIVE" | "INACTIVE"
}

export interface BusinessMember {
  id: string
  businessId: string
  userId: string
  name: string
  email: string
  avatar?: string
  role: BusinessRole
  status: TeamMemberStatus
  joinedAt: string
}

export interface Review {
  id: string
  businessId: string
  businessName: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: 1 | 2 | 3 | 4 | 5
  content: string
  isVerified: boolean
  status: ReviewStatus
  moderationStatus: ModerationStatus
  reportCount: number
  reply?: { content: string; repliedAt: string; repliedBy: string }
  createdAt: string
}

export interface VerificationDocument {
  id: string
  name: string
  type: string
  uploadedAt: string
}

export interface VerificationRequest {
  id: string
  businessId: string
  businessName: string
  submittedBy: string
  status: VerificationStatus
  documents: VerificationDocument[]
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reason?: string
  history: { status: VerificationStatus; note: string; at: string }[]
}

export interface Report {
  id: string
  reviewId: string
  reviewExcerpt: string
  reviewRating: 1 | 2 | 3 | 4 | 5
  businessId: string
  businessName: string
  reviewerName: string
  reporterName: string
  reason: string
  evidence?: string[]
  status: ReportStatus
  moderationStatus: ModerationStatus
  createdAt: string
}

export interface Invitation {
  id: string
  businessId: string
  businessName: string
  customerName: string
  contact: string
  referenceId?: string
  channel: InvitationChannel
  sentAt: string
  status: InvitationStatus
  reviewGenerated: boolean
}

export interface AuditLogEntry {
  id: string
  actorName: string
  actorRole: PlatformRole
  action: string
  target: string
  timestamp: string
  metadata?: string
}

export interface FraudFlag {
  id: string
  entityType: "ACCOUNT" | "REVIEW"
  entityLabel: string
  riskLevel: RiskLevel
  indicators: string[]
  detectedAt: string
  status: "OPEN" | "DISMISSED" | "INVESTIGATING"
}

export interface Category {
  id: string
  name: string
  businessCount: number
  status: "ACTIVE" | "INACTIVE"
}

export interface ActivityItem {
  id: string
  icon: "reply" | "review" | "verification" | "team" | "report"
  text: string
  at: string
}

export interface RatingTrendPoint {
  period: string
  rating: number
}

export interface RatingDistribution {
  5: number
  4: number
  3: number
  2: number
  1: number
}
