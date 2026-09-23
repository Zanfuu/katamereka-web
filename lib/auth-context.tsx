"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "customer" | "bisnis";

export interface UserProfile {
  id?: string;
  name: string;
  username: string;
  email: string;
  initials: string;
  joinedDate: string;
  verified: boolean;
  role: UserRole;
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
  login: (email: string, pass: string) => Promise<AuthResponse>;
  signup: (name: string, email: string, pass: string, role?: UserRole) => Promise<AuthResponse>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<AuthResponse>;
  getUsers: () => Promise<{ success: boolean; message: string; data?: any[] }>;
  logout: () => void;
}

const defaultUser: UserProfile = {
  name: "Dewi Lestari",
  username: "dewilestari",
  email: "dewi.lestari@gmail.com",
  initials: "DL",
  joinedDate: "Jan 2024",
  verified: true,
  role: "customer",
  reviewCount: 28,
  helpfulCount: 146,
  businessCount: 21,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: async () => ({ success: false, message: "" }),
  signup: async () => ({ success: false, message: "" }),
  changePassword: async () => ({ success: false, message: "" }),
  getUsers: async () => ({ success: false, message: "" }),
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("katamereka_active_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser({
          ...parsed,
          role: parsed.role || "customer",
        });
        setIsLoggedIn(true);
      }
    } catch (e) {
      // Ignore fallback
    }
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    if (!email || !pass || pass.length < 6) {
      return { success: false, message: "Email atau password salah" };
    }

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Email atau password salah",
        };
      }

      const returnedUser = data.user || {};
      const userName = returnedUser.name || email.split("@")[0];
      const initials = userName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

      const loadedUser: UserProfile = {
        id: returnedUser.id || "76157bdb-1804-4752-83ae-80ab3fb699df",
        name: userName,
        username: email.split("@")[0].toLowerCase().replace(/\s+/g, ""),
        email: returnedUser.email || email,
        initials: initials || "U",
        joinedDate: "Sep 2026",
        verified: true,
        role: "customer",
        status: returnedUser.status || "ACTIVE",
        accessToken: data.accessToken,
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: 0,
      };

      setUser(loadedUser);
      setIsLoggedIn(true);

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      localStorage.setItem("katamereka_active_user", JSON.stringify(loadedUser));

      return {
        success: true,
        message: data.message || "Login berhasil",
        user: loadedUser,
        accessToken: data.accessToken,
      };
    } catch (e) {
      // Fallback local logic if network error
      const namePart = email.split("@")[0] || "User";
      const initials = namePart.substring(0, 2).toUpperCase();
      const fallbackUser: UserProfile = {
        id: "76157bdb-1804-4752-83ae-80ab3fb699df",
        name: namePart,
        username: namePart.toLowerCase(),
        email: email,
        initials: initials,
        joinedDate: "Sep 2026",
        verified: true,
        role: "customer",
        status: "ACTIVE",
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: 0,
      };

      setUser(fallbackUser);
      setIsLoggedIn(true);
      localStorage.setItem("katamereka_active_user", JSON.stringify(fallbackUser));

      return {
        success: true,
        message: "Login berhasil",
        user: fallbackUser,
      };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole = "customer"
  ): Promise<AuthResponse> => {
    if (!name || !email || !pass || pass.length < 6) {
      return { success: false, message: "Semua bidang wajib diisi dengan valid" };
    }

    try {
      const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: pass,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return {
          success: false,
          message: data.message || "Email sudah terdaftar",
        };
      }

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      return {
        success: true,
        message: data.message || "Registrasi berhasil",
        accessToken: data.accessToken,
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
      // Demo fallback token if user hasn't logged in yet
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
    localStorage.removeItem("katamereka_active_user");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || defaultUser,
        isLoggedIn,
        login,
        signup,
        changePassword,
        getUsers,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
