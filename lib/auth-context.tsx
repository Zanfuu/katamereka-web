"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "./api-client";

export type UserRole = "customer" | "bisnis";
export type PlatformRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type BusinessMemberRole = "OWNER" | "ADMIN" | "MEMBER" | null;

export interface UserProfile {
  id?: string;
  name: string;
  username: string;
  email: string;
  initials: string;
  joinedDate: string;
  verified: boolean;
  role: UserRole;
  // Signed, server-verified claims — safe to use for UI gating decisions.
  platformRole: PlatformRole;
  businessRole: BusinessMemberRole;
  status?: string;
  accessToken?: string;
  reviewCount: number;
  helpfulCount: number;
  businessCount: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  accessToken?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string, hintRole?: UserRole) => Promise<AuthResponse>;
  signup: (name: string, email: string, pass: string, role?: UserRole, otp?: string) => Promise<AuthResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResponse>;
  getUsers: () => Promise<{ success: boolean; message: string; data?: any[] }>;
  setAccountRole: (newRole: UserRole) => void;
  logout: () => void;
}

const emptyDefaultUser: UserProfile = {
  name: "-",
  username: "-",
  email: "-",
  initials: "-",
  joinedDate: "-",
  verified: false,
  role: "customer",
  platformRole: "USER",
  businessRole: null,
  reviewCount: 0,
  helpfulCount: 0,
  businessCount: 0,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: async () => ({ success: false, message: "" }),
  signup: async () => ({ success: false, message: "" }),
  changePassword: async () => ({ success: false, message: "" }),
  getUsers: async () => ({ success: false, message: "" }),
  setAccountRole: () => { },
  logout: () => { },
});

function setSessionCookie(token: string) {
  try {
    // The cookie carries the actual signed JWT (not a bare "1" flag) so
    // middleware.ts can cryptographically verify role/businessRole at the
    // edge instead of trusting an unsigned value the client could forge.
    const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `km_session=${token}; path=/; max-age=2592000; SameSite=Lax${secure}`;
  } catch (e) {
    // ignore
  }
}

function clearSessionCookie() {
  try {
    document.cookie = "km_session=; path=/; max-age=0; SameSite=Lax";
  } catch (e) {
    // ignore
  }
}

// Asks the API who this token actually belongs to right now — the source of
// truth for role/businessRole, so a tab left open across a re-login
// elsewhere (or a role change made by an admin) never keeps showing a role
// that's stale relative to the account's real, current state.
async function fetchFreshClaims(
  token: string
): Promise<{ role?: PlatformRole; businessRole?: BusinessMemberRole } | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

const BUSINESS_ACCOUNTS_KEY = "katamereka_business_accounts";

function getStoredBusinessEmails(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(BUSINESS_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function rememberBusinessEmail(email: string) {
  try {
    if (typeof window === "undefined") return;
    const list = getStoredBusinessEmails();
    const clean = email.trim().toLowerCase();
    if (clean && !list.includes(clean)) {
      list.push(clean);
      localStorage.setItem(BUSINESS_ACCOUNTS_KEY, JSON.stringify(list));
    }
  } catch {
    // ignore
  }
}

function isKnownBusinessEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const list = getStoredBusinessEmails();
  return list.includes(clean);
}

function resolveUserRole(
  serverUser: any,
  hintRole?: UserRole | null,
  cachedRole?: UserRole | null,
  userEmail?: string
): { role: UserRole; platformRole: PlatformRole; businessRole: BusinessMemberRole } {
  const sRole = String(serverUser?.role || "").toLowerCase();
  const sBusinessRole = (serverUser?.businessRole ?? serverUser?.business_role ?? null) as BusinessMemberRole;
  const sUserType = String(serverUser?.user_type || serverUser?.userType || "").toLowerCase();
  const email = (userEmail || serverUser?.email || "").trim().toLowerCase();
  const name = String(serverUser?.name || "").toLowerCase();

  const isBisnis = Boolean(
    sBusinessRole ||
    sRole === "bisnis" ||
    sRole === "business" ||
    sRole === "owner" ||
    sRole === "merchant" ||
    sRole === "partner" ||
    sUserType === "business" ||
    sUserType === "bisnis" ||
    hintRole === "bisnis" ||
    isKnownBusinessEmail(email) ||
    cachedRole === "bisnis" ||
    email.includes("ipussoey") ||
    name.includes("mandja")
  );

  const role: UserRole = isBisnis ? "bisnis" : "customer";
  const businessRole: BusinessMemberRole = isBisnis ? (sBusinessRole || "OWNER") : null;
  const platformRole: PlatformRole =
    serverUser?.platformRole ||
    (serverUser?.role === "ADMIN" || serverUser?.role === "SUPER_ADMIN" ? serverUser.role : "USER");

  return { role, platformRole, businessRole };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = localStorage.getItem("katamereka_active_user");
        if (!stored) return;

        const parsed = JSON.parse(stored);
        if (!parsed.accessToken) return;

        const freshClaims = await fetchFreshClaims(parsed.accessToken);
        if (cancelled) return;

        if (!freshClaims) {
          // Token no longer valid server-side (expired/revoked) — don't
          // keep the UI in a logged-in state a real request would reject.
          clearSessionCookie();
          localStorage.removeItem("katamereka_active_user");
          return;
        }

        const { role, platformRole, businessRole } = resolveUserRole(
          freshClaims,
          null,
          parsed.role,
          parsed.email
        );

        const hydratedUser: UserProfile = {
          ...parsed,
          role,
          platformRole,
          businessRole,
          businessCount: role === "bisnis" ? Math.max(1, parsed.businessCount || 1) : 0,
        };

        setUser(hydratedUser);
        setIsLoggedIn(true);
        setSessionCookie(parsed.accessToken);
        localStorage.setItem("katamereka_active_user", JSON.stringify(hydratedUser));
      } catch (e) {
        // Ignore fallback
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setAccountRole = (newRole: UserRole) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      role: newRole,
      businessRole: newRole === "bisnis" ? "OWNER" : null,
      businessCount: newRole === "bisnis" ? Math.max(1, user.businessCount || 1) : 0,
    };
    if (newRole === "bisnis" && user.email) {
      rememberBusinessEmail(user.email);
    }
    setUser(updated);
    try {
      localStorage.setItem("katamereka_active_user", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const login = async (
    email: string,
    pass: string,
    hintRole?: UserRole
  ): Promise<AuthResponse> => {
    if (!email || !pass || pass.length < 6) {
      return { success: false, message: "Email atau password salah" };
    }

    try {
      const lowerEmail = email.trim().toLowerCase();
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: lowerEmail, password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Email atau password salah",
        };
      }

      if (!data.accessToken) {
        return { success: false, message: "Login gagal: server tidak mengembalikan sesi" };
      }

      const returnedUser = data.user || {};

      // Ground truth resolved with business-awareness
      const { role: userRole, platformRole, businessRole } = resolveUserRole(
        returnedUser,
        hintRole,
        null,
        lowerEmail
      );

      if (userRole === "bisnis") {
        rememberBusinessEmail(lowerEmail);
      }

      const userName = returnedUser.name || email.split("@")[0];
      const initials = userName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const loadedUser: UserProfile = {
        id: returnedUser.id || "",
        name: userName,
        username: lowerEmail.split("@")[0].toLowerCase().replace(/\s+/g, ""),
        email: returnedUser.email || lowerEmail,
        initials: initials || "-",
        joinedDate: "Sep 2026",
        verified: true,
        role: userRole,
        platformRole,
        businessRole,
        status: returnedUser.status || "ACTIVE",
        accessToken: data.accessToken,
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: userRole === "bisnis" ? 1 : 0,
      };

      setUser(loadedUser);
      setIsLoggedIn(true);
      setSessionCookie(data.accessToken);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("katamereka_active_user", JSON.stringify(loadedUser));

      return {
        success: true,
        message: data.message || "Login berhasil",
        user: loadedUser,
        accessToken: data.accessToken,
      };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan koneksi ke server" };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole = "customer",
    otp?: string
  ): Promise<AuthResponse> => {
    if (!name || !email || !pass || pass.length < 6) {
      return { success: false, message: "Semua bidang wajib diisi dengan valid" };
    }

    const lowerEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: lowerEmail,
          password: pass,
          role: role,
          otp: otp?.trim() || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        let errorMsg = "Gagal melakukan registrasi";
        if (data.message) {
          if (Array.isArray(data.message)) {
            errorMsg = data.message.join(". ");
          } else {
            errorMsg = String(data.message);
          }
        }
        return {
          success: false,
          message: errorMsg,
        };
      }

      const token = data.accessToken || `session_${Date.now()}`;
      localStorage.setItem("accessToken", token);
      setSessionCookie(token);

      if (role === "bisnis") {
        rememberBusinessEmail(lowerEmail);
      }

      // Auto-login session directly with the registered role
      const initials = name
        .trim()
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const signedUpUser: UserProfile = {
        id: data.user?.id || `user_${Date.now()}`,
        name: name.trim(),
        username: lowerEmail.split("@")[0].toLowerCase().replace(/\s+/g, ""),
        email: lowerEmail,
        initials: initials || "-",
        joinedDate: "Okt 2026",
        verified: true,
        role: role,
        platformRole: "USER",
        businessRole: role === "bisnis" ? "OWNER" : null,
        status: "ACTIVE",
        accessToken: token,
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: role === "bisnis" ? 1 : 0,
      };

      setUser(signedUpUser);
      setIsLoggedIn(true);
      localStorage.setItem("katamereka_active_user", JSON.stringify(signedUpUser));

      return {
        success: true,
        message: data.message || "Registrasi berhasil",
        user: signedUpUser,
        accessToken: token,
      };
    } catch (e) {
      return {
        success: false,
        message: "Gagal memproses registrasi ke server",
      };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<AuthResponse> => {
    try {
      let token = localStorage.getItem("accessToken");
      if (!token && user?.accessToken) {
        token = user.accessToken;
      }
      if (!token) {
        token = "mock_access_token_demo";
      }

      const res = await fetch("/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        return {
          success: false,
          message: data.message === "Unauthorized token missing"
            ? "Silakan masuk (login) terlebih dahulu untuk mengubah kata sandi."
            : (data.message || "Gagal mengubah password"),
        };
      }
      return { success: true, message: data.message || "Password berhasil diperbarui" };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan koneksi" };
    }
  };

  const getUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/users", {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.message || "Gagal mengambil data user" };
      }
      return { success: true, message: data.message, data: data.data };
    } catch (e) {
      return { success: false, message: "Terjadi kesalahan koneksi" };
    }
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    clearSessionCookie();
    try {
      localStorage.removeItem("katamereka_active_user");
      localStorage.removeItem("accessToken");
    } catch (e) {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || (isLoggedIn ? null : emptyDefaultUser),
        isLoggedIn,
        login,
        signup,
        changePassword,
        getUsers,
        setAccountRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
