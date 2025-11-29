/**
 * Auth Context Provider
 * Provides authentication state and methods to all components
 */

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  deleteAccount: (password?: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
