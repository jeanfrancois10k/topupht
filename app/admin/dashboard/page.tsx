"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, Users, Store, Gamepad2, Wallet, Activity } from "lucide-react";

interface AdminStats {
  total_users: number;
  total_sellers: number;
  total_orders: number;
  successful_orders: number;
  total_revenue: string;
  total_commissions: string;
  active_games: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [{ data: users }, { data: sellers }, { data: orders }, { data: games }, { data: revenue }] = await Promise.all([
          supabaseClient.from("profiles").select("id", { count: "exact", head: true }),
          supabaseClient.from("seller_profiles").select("id", { count: "exact", head: true }),
          supabaseClient.from("orders").select("id", { count: "exact", head: true }).eq("status", "SUCCESS"),
          supabaseClient.from("games").select("id", { count: "exact", head: true }).eq("is_active", true),
          supabaseClient.from("orders").select("amount", { count: "exact", head: true }).eq("status", "SUCCESS"),
        ]);

        const totalRevenue = orders?.reduce((sum: number, o: { amount: string }) => sum + parseFloat(o.amount), 0) || 0;
        setStats({
          total_users: users?.length ?? 0,
          total_sellers: sellers?.length ?? 0,
          total_orders: orders?.length ?? 0,
          successful_orders: orders?.length ?? 0,
          total_revenue: totalRevenue.toFixed(2),
          total_commissions: "0",
          active_games: games?.length ?? 0,
        });
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Utilisateurs", value: stats?.total_users, icon: Users, color: "text-brand-400" },
    { label: "Vendeurs", value: stats?.total_sellers, icon: Store, color: "text-purple-400" },
    { label: "Commandes", value: stats?.total_orders, icon: ShoppingBag, color: "text-htg-400" },
    { label: "Revenus", value: stats?.total_revenue ? formatCurrency(stats.total_revenue) : "0 HTG", icon: Wallet, color: "text-yellow-400" },
    { label: "Jeux actifs", value: stats?.active_games, icon: Gamepad2, color: "text-indigo-400" },
    { label: "Commissions", value: stats?.total_commissions ? formatCurrency(stats.total_commissions) : "0 HTG", icon: Activity, color: "text-pink-400" },
  ];

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Tableau de bord Admin</h1>
        <p className="mt-1 text-surface-400">Vue d'ensemble de la plateforme</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-surface-700 bg-surface-800">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-surface-400">{card.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${card.color}`}>{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestion rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a href="/admin/games" className="block rounded-lg bg-surface-700 p-3 text-sm font-medium text-white hover:bg-surface-600">Gérer les jeux</a>
              <a href="/admin/products" className="block rounded-lg bg-surface-700 p-3 text-sm font-medium text-white hover:bg-surface-600">Gérer les produits</a>
              <a href="/admin/users" className="block rounded-lg bg-surface-700 p-3 text-sm font-medium text-white hover:bg-surface-600">Gérer les utilisateurs</a>
              <a href="/admin/sellers" className="block rounded-lg bg-surface-700 p-3 text-sm font-medium text-white hover:bg-surface-600">Gérer les vendeurs</a>
              <a href="/admin/orders" className="block rounded-lg bg-surface-700 p-3 text-sm font-medium text-white hover:bg-surface-600">Gérer les commandes</a>
              <a href="/admin/settings" className="block rounded-lg bg-surface-700 p-3 text-sm font-medium text-white hover:bg-surface-600">Paramètres</a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-yellow-500/10 p-3">
                <Badge variant="warning">PENDING</Badge>
                <p className="text-sm text-surface-300">Demandes de vendeurs en attente</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-blue-500/10 p-3">
                <Badge variant="info">PROCESSING</Badge>
                <p className="text-sm text-surface-300">Commandes en cours de traitement</p>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-surface-500/10 p-3">
                <Badge variant="default">SYSTEM</Badge>
                <p className="text-sm text-surface-300">Vérifier les logs d'audit</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}