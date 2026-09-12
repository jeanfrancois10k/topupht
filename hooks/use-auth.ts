// @ts-nocheck
"use client";

import { useEffect, useCallback, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { type User, type Profile } from "@/types/shared";
import { supabaseClient } from "@/config/supabase";

export function useAuth() {
  const { user, profile, isLoading, isAuthenticated, setUser, setProfile, setLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const syncUser = useCallback(async (supabaseUser: any) => {
    if (!supabaseUser) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      const userObj = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        phone: null,
        full_name: data?.full_name ?? null,
        avatar_url: data?.avatar_url ?? null,
        role: data?.role ?? "GAMER",
        status: data?.status ?? "ACTIVE",
        created_at: data?.created_at ?? new Date().toISOString(),
        updated_at: data?.updated_at ?? new Date().toISOString(),
      };

      const profileObj = {
        id: data?.id ?? supabaseUser.id,
        email: supabaseUser.email,
        phone: data?.phone ?? null,
        full_name: data?.full_name ?? null,
        avatar_url: data?.avatar_url ?? null,
        role: data?.role ?? "GAMER",
        status: data?.status ?? "ACTIVE",
        created_at: data?.created_at ?? new Date().toISOString(),
        updated_at: data?.updated_at ?? new Date().toISOString(),
      };

      setUser(userObj);
      setProfile(profileObj);
    } catch {
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: "GAMER",
      });
    } finally {
      setLoading(false);
    }
  }, [setUser, setProfile, setLoading]);

  useEffect(() => {
    let mounted = true;

    async function getSession() {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (!mounted) return;
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        if (session?.user) {
          await syncUser(session.user);
        } else {
          setLoading(false);
        }
      } catch {
        if (!mounted) return;
        setLoading(false);
      }
    }

    getSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        syncUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUser, setLoading, setUser, setProfile]);

  const signUp = useCallback(async (email: string, password: string, fullName?: string, phone?: string) => {
    setError(null);
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone,
            role: "GAMER",
          },
        },
      });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'inscription";
      setError(message);
      return { data: null, error: message };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        await syncUser(data.user);
      }
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la connexion";
      setError(message);
      return { data: null, error: message };
    }
  }, [syncUser]);

  const signOut = useCallback(async () => {
    setError(null);
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(message);
    }
  }, [setUser, setProfile, setLoading]);

  const resetPassword = useCallback(async (email: string) => {
    setError(null);
    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la réinitialisation";
      setError(message);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    setError(null);
    try {
      const { data, error } = await supabaseClient
        .from("profiles")
        .update(updates as any)
        .eq("id", profile?.id ?? user?.id ?? "")
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour";
      setError(message);
      return { data: null, error: message };
    }
  }, [profile, user, setProfile]);

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    hasRole: useAuthStore((s) => s.hasRole),
    isAdmin: useAuthStore((s) => s.isAdmin),
    isSeller: useAuthStore((s) => s.isSeller),
  };
}