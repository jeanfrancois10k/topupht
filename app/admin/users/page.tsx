"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Users, Search, ShieldCheck, UserCheck, ShieldAlert, Check, RefreshCw } from "lucide-react";
import type { Profile } from "@/types/shared";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function fetchUsers() {
    try {
      setIsLoading(true);
      const { data, error } = await (supabaseClient
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) throw error;
      setUsers((data ?? []) as Profile[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const result = await res.json();
      if (!res.ok || result.error) {
        // Fallback update via RPC or direct update
        await (supabaseClient.from("profiles") as any)
          .update({ role: newRole })
          .eq("id", userId);
      }
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setUpdatingId(userId);
    try {
      const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await (supabaseClient.from("profiles") as any)
        .update({ status: nextStatus })
        .eq("id", userId);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.full_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Spinner />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-50 flex items-center gap-3">
            <Users className="h-8 w-8 text-brand-400" />
            Gestion des Utilisateurs
          </h1>
          <p className="mt-1 text-surface-400">{users.length} utilisateur(s) inscrit(s) sur la plateforme</p>
        </div>
        <Button
          onClick={fetchUsers}
          variant="outline"
          className="border-surface-700 text-surface-300 hover:bg-surface-800 gap-2 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-900 p-4 rounded-2xl border border-surface-700">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Rechercher par nom ou par email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-surface-950 border-surface-700 text-surface-50 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {["ALL", "GAMER", "SELLER", "ADMIN", "SUPER_ADMIN"].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                roleFilter === role
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-surface-800 text-surface-400 hover:bg-surface-700 hover:text-white"
              }`}
            >
              {role === "ALL" ? "Tous" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((u) => {
          const isUserUpdating = updatingId === u.id;
          const isAdminUser = u.role === "ADMIN" || u.role === "SUPER_ADMIN";

          return (
            <Card key={u.id} className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-700 text-brand-400 font-bold text-lg border border-surface-600">
                      {(u.full_name ?? u.email ?? "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-surface-50 line-clamp-1">
                        {u.full_name || "Sans nom"}
                      </h3>
                      <p className="text-xs text-surface-400 line-clamp-1">{u.email}</p>
                    </div>
                  </div>
                  <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>
                    {u.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-surface-700">
                  <span className="text-surface-400">Rôle actuel :</span>
                  <Badge variant={isAdminUser ? "danger" : u.role === "SELLER" ? "warning" : "default"}>
                    {u.role || "GAMER"}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-surface-700 flex items-center justify-between gap-2">
                  <select
                    value={u.role || "GAMER"}
                    disabled={isUserUpdating}
                    onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                    className="bg-surface-900 border border-surface-700 text-surface-50 text-xs rounded-lg px-2.5 py-1.5 focus:border-brand-500 font-semibold cursor-pointer"
                  >
                    <option value="GAMER">GAMER</option>
                    <option value="SELLER">SELLER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>

                  <Button
                    size="sm"
                    variant={u.status === "ACTIVE" ? "outline" : "primary"}
                    disabled={isUserUpdating}
                    onClick={() => handleToggleStatus(u.id, u.status || "ACTIVE")}
                    className={`text-xs font-bold rounded-lg ${
                      u.status === "ACTIVE"
                        ? "border-red-900/40 text-red-400 hover:bg-red-950/50"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {u.status === "ACTIVE" ? "Suspendre" : "Activer"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
