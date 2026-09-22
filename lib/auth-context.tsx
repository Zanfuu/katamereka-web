"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  username: string;
  email: string;
  initials: string;
  joinedDate: string;
  verified: boolean;
  reviewCount: number;
  helpfulCount: number;
  businessCount: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  login: (email: string, pass: string) => boolean;
  signup: (username: string, email: string, pass: string) => boolean;
  logout: () => void;
}

const defaultUser: UserProfile = {
  name: "Dewi Lestari",
  username: "dewilestari",
  email: "dewi.lestari@gmail.com",
  initials: "DL",
  joinedDate: "Jan 2024",
  verified: true,
  reviewCount: 28,
  helpfulCount: 146,
  businessCount: 21,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  login: () => true,
  signup: () => true,
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
        setUser(parsed);
        setIsLoggedIn(true);
      }
    } catch (e) {
      // Ignore fallback
    }
  }, []);

  const login = (email: string, pass: string): boolean => {
    if (!email || !pass || pass.length < 6) return false;

    // Check if there is a registered user with this email in localStorage
    let loadedUser: UserProfile | null = null;
    try {
      const storedReg = localStorage.getItem(`registered_user_${email.toLowerCase()}`);
      if (storedReg) {
        loadedUser = JSON.parse(storedReg);
      } else {
        const lastReg = localStorage.getItem("last_registered_user");
        if (lastReg) {
          const parsedLast = JSON.parse(lastReg);
          if (parsedLast.email.toLowerCase() === email.toLowerCase()) {
            loadedUser = parsedLast;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    if (!loadedUser) {
      // Create user profile based on email/username input
      const namePart = email.split("@")[0] || "User";
      const formattedName = namePart
        .split(/[._-]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      const initials = namePart.substring(0, 2).toUpperCase();

      loadedUser = {
        name: formattedName,
        username: namePart.toLowerCase().replace(/\s+/g, ""),
        email: email,
        initials: initials || "U",
        joinedDate: "Sep 2026",
        verified: true,
        reviewCount: 0,
        helpfulCount: 0,
        businessCount: 0,
      };
    }

    setUser(loadedUser);
    setIsLoggedIn(true);
    localStorage.setItem("katamereka_active_user", JSON.stringify(loadedUser));
    return true;
  };

  const signup = (username: string, email: string, pass: string): boolean => {
    if (!username || !email || !pass || pass.length < 6) return false;

    const formattedName = username
      .split(/[._-]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const initials = username
      .substring(0, 2)
      .toUpperCase();

    const newRegUser: UserProfile = {
      name: formattedName,
      username: username.toLowerCase().replace(/\s+/g, ""),
      email: email,
      initials: initials || "U",
      joinedDate: "Sep 2026",
      verified: true,
      reviewCount: 0,
      helpfulCount: 0,
      businessCount: 0,
    };

    // Save registered user WITHOUT auto-login so user must log in via /login first
    localStorage.setItem(`registered_user_${email.toLowerCase()}`, JSON.stringify(newRegUser));
    localStorage.setItem("last_registered_user", JSON.stringify(newRegUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("katamereka_active_user");
  };

  return (
    <AuthContext.Provider value={{ user: user || defaultUser, isLoggedIn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
