"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";

interface AuthContextValue {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: ReturnType<typeof useAuth>["signUp"];
  signIn: ReturnType<typeof useAuth>["signIn"];
  signOut: ReturnType<typeof useAuth>["signOut"];
  resetPassword: ReturnType<typeof useAuth>["resetPassword"];
  updateProfile: ReturnType<typeof useAuth>["updateProfile"];
  hasRole: ReturnType<typeof useAuth>["hasRole"];
  isAdmin: ReturnType<typeof useAuth>["isAdmin"];
  isSeller: ReturnType<typeof useAuth>["isSeller"];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuthContext must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-surface-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}