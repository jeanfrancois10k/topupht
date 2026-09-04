import { create } from "zustand";
import { createClient } from "@supabase/supabase-js";
import type { User, Profile, UserRole } from "@/types/shared";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  isAdmin: () => boolean;
  isSeller: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, profile: null, isAuthenticated: false }),
  hasRole: (...roles) => {
    const { profile } = get();
    return profile ? roles.includes(profile.role as UserRole) : false;
  },
  isAdmin: () => {
    const { profile } = get();
    return profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";
  },
  isSeller: () => {
    const { profile } = get();
    return profile?.role === "SELLER" || profile?.role === "PRO_SELLER" || profile?.role === "PARTNER";
  },
}));