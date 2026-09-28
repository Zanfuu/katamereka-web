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
