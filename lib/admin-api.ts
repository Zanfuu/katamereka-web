/**
 * Super Admin — Admin & Customer Management API client
 * Wraps api_service's admin-management module:
 *  - GET    /admin/admins           (Endpoint A)
 *  - POST   /admin/admins           (Endpoint C)
 *  - PATCH  /admin/admins/:id/status
 *  - DELETE /admin/admins/:id
 *  - GET    /admin/customers        (Endpoint B)
 *  - PATCH  /admin/customers/:id/status
 *  - DELETE /admin/customers/:id
 * All routes require a SUPER_ADMIN JWT (Authorization: Bearer <accessToken>).
 */

import { API_BASE_URL } from "./api-client";

export type PlatformUserStatus = "ACTIVE" | "PENDING" | "SUSPENDED" | "BANNED";

export interface AdminListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  business_count: number;
  status: PlatformUserStatus;
  last_login_at: string | null;
  created_at: string;
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: PlatformUserStatus;
  last_login_at: string | null;
  created_at: string;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AdminListResponse {
  data: AdminListItem[];
  stats: { total_admin: number; active_admin: number; suspended_admin: number };
  pagination: ApiPagination;
}

export interface CustomerListResponse {
  data: CustomerListItem[];
  stats: { total_customer: number; active_customer: number; suspended_customer: number };
  pagination: ApiPagination;
}

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlatformUserStatus;
  startDate?: string;
  endDate?: string;
}

export class AdminApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AdminApiError";
    this.statusCode = statusCode;
  }
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildQuery(params: AdminQueryParams): string {
  const qs = new URLSearchParams();
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.search) qs.append("search", params.search);
  if (params.status) qs.append("status", params.status);
  if (params.startDate) qs.append("startDate", params.startDate);
  if (params.endDate) qs.append("endDate", params.endDate);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Request gagal (${res.status})`;
    throw new AdminApiError(message, res.status);
  }
  return data as T;
}

// --- Admin Bisnis ---

export async function fetchAdmins(params: AdminQueryParams = {}): Promise<AdminListResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/admins${buildQuery(params)}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });
  return handle<AdminListResponse>(res);
}

export async function createAdmin(payload: {
  name: string;
  email: string;
  password: string;
  status?: PlatformUserStatus;
}): Promise<{ message: string; data: Partial<AdminListItem> }> {
  const res = await fetch(`${API_BASE_URL}/admin/admins`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function updateAdminStatus(
  id: string,
  status: PlatformUserStatus
): Promise<{ message: string; data: Partial<AdminListItem> }> {
  const res = await fetch(`${API_BASE_URL}/admin/admins/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handle(res);
}

export async function deleteAdmin(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/admins/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(res);
}

// --- Customer ---

export async function fetchCustomers(params: AdminQueryParams = {}): Promise<CustomerListResponse> {
  const res = await fetch(`${API_BASE_URL}/admin/customers${buildQuery(params)}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });
  return handle<CustomerListResponse>(res);
}

export async function updateCustomerStatus(
  id: string,
  status: PlatformUserStatus
): Promise<{ message: string; data: Partial<CustomerListItem> }> {
  const res = await fetch(`${API_BASE_URL}/admin/customers/${id}/status`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  return handle(res);
}

export async function deleteCustomer(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/admin/customers/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  return handle(res);
}

// --- Business (Add Business CRUD) ---
// Expects api_service's admin-businesses module (SUPER_ADMIN/ADMIN JWT):
//  - GET    /admin/businesses
//  - POST   /admin/businesses
//  - PATCH  /admin/businesses/:id
//  - DELETE /admin/businesses/:id

export type PlatformBusinessStatus = "PENDING" | "ACTIVE" | "CLAIMED" | "SUSPENDED" | "INACTIVE";

export interface BusinessListItem {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  status: PlatformBusinessStatus;
  average_rating: number | null;
  review_count: number;
  created_at: string;
}

export interface BusinessListResponse {
  data: BusinessListItem[];
  stats: { total_business: number; active_business: number; pending_business: number };
  pagination: ApiPagination;
}

export interface BusinessQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PlatformBusinessStatus;
}

export interface BusinessPayload {
  name: string;
  slug: string;
  category?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  status?: PlatformBusinessStatus;
}

export async function fetchBusinesses(params: BusinessQueryParams = {}): Promise<BusinessListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.search) qs.append("search", params.search);
  if (params.status) qs.append("status", params.status);
  const s = qs.toString();

  const res = await fetch(`${API_BASE_URL}/businesses${s ? `?${s}` : ""}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  const raw = await handle<any>(res);
  const rawList = Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw) ? raw : []);
  const data: BusinessListItem[] = rawList.map((b: any) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    category: b.category || null,
    address: b.address || null,
    city: b.city || null,
    province: b.province || null,
    phone: b.phone || null,
    email: b.email || null,
    website: b.website || null,
    description: b.description || null,
    status: (b.status || (b.is_claimed ? "CLAIMED" : "ACTIVE")) as PlatformBusinessStatus,
    average_rating: b.average_rating ?? b.rating ?? null,
    review_count: b.review_count ?? b.reviews_count ?? 0,
    created_at: b.created_at || b.updated_at || new Date().toISOString(),
  }));

  const total = raw?.pagination?.total ?? data.length;
  const stats = raw?.stats || {
    total_business: total,
    active_business: data.filter((x) => x.status === "ACTIVE" || x.status === "CLAIMED").length || total,
    pending_business: data.filter((x) => x.status === "PENDING").length,
  };

  return {
    data,
    stats,
    pagination: raw?.pagination || {
      page: params.page || 1,
      limit: params.limit || 10,
      total,
      total_pages: Math.ceil(total / (params.limit || 10)) || 1,
    },
  };
}

export async function createBusiness(
  payload: BusinessPayload
): Promise<{ message: string; data: BusinessListItem }> {
  const res = await fetch(`${API_BASE_URL}/businesses`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await handle<any>(res);
  return {
    message: result.message || "Bisnis berhasil ditambahkan",
    data: result.data || result,
  };
}

export async function updateBusiness(
  id: string,
  payload: Partial<BusinessPayload>
): Promise<{ message: string; data: BusinessListItem }> {
  const res = await fetch(`${API_BASE_URL}/businesses/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  const result = await handle<any>(res);
  return {
    message: result.message || "Bisnis berhasil diperbarui",
    data: result.data || result,
  };
}

export async function deleteBusiness(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/businesses/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  return handle(res);
}

// --- Trust & Safety (Review Reports) ---

export interface AdminReviewReportItem {
  id: string;
  reason: string;
  description: string | null;
  status: "PENDING" | "RESOLVED" | "REJECTED";
  resolution: "KEEP" | "HIDE" | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewer_name: string | null;
  business: { id: string; name: string; slug: string } | null;
  review: {
    id: string;
    rating: number;
    content: string;
    status: string;
    author: { id: string; name: string; email: string } | null;
  } | null;
  reporter: { id: string; name: string; email: string } | null;
}

export interface AdminReviewReportsResponse {
  data: AdminReviewReportItem[];
  pagination: ApiPagination;
}

export async function fetchAdminReviewReports(
  params: {
    page?: number;
    limit?: number;
    status?: string;
    reason?: string;
  } = {}
): Promise<AdminReviewReportsResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.append("page", String(params.page));
  if (params.limit) qs.append("limit", String(params.limit));
  if (params.status && params.status !== "all") qs.append("status", params.status);
  if (params.reason && params.reason !== "all") qs.append("reason", params.reason);
  const s = qs.toString();
  const res = await fetch(`${API_BASE_URL}/admin/review-reports${s ? `?${s}` : ""}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });
  return handle<AdminReviewReportsResponse>(res);
}

// --- Audit Logs ---

export interface AdminAuditLogItem {
  id: string;
  action_type?: string;
  actionType?: string;
  data: any;
  created_at?: string;
  createdAt?: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export async function fetchAdminAuditLogs(limit = 100): Promise<{
  success: boolean;
  message: string;
  data: AdminAuditLogItem[];
}> {
  const res = await fetch(`${API_BASE_URL}/customer-logs?limit=${limit}`, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });
  return handle(res);
}
