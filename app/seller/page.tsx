"use client";
// @ts-nocheck
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, WalletIcon, Activity, Tag } from "lucide-react";
import type { SellerProfile, Order, WalletTransaction } from "@/types/shared";

export default function SellerDashboardPage() {
  const { profile } = useAuth();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalCommissions: 0, currentBalance: "0", activeProducts: 0, pendingWithdrawals: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return;
      try {
        const [spRes, statsRes] = await Promise.all([
          supabaseClient.from("seller_profiles").select("*").eq("user_id", profile.id).single(),
          (supabaseClient.rpc as any)("seller_dashboard_stats", { p_seller_id: profile.id }),
        ]);
        setSellerProfile((spRes.data ?? null) as SellerProfile | null);
        const statsData = (statsRes as any)?.data?.[0] ?? { totalSales: 0, totalOrders: 0, totalCommissions: 0, currentBalance: "0", activeProducts: 0, pendingWithdrawals: 0 }; setStats(statsData as any);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!sellerProfile || sellerProfile.status !== "APPROVED") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-surface-700 bg-surface-800 text-center">
          <CardContent className="p-8">
            <Tag className="mx-auto h-12 w-12 text-surface-600" />
            <h2 className="mt-4 text-xl font-bold text-surface-50">{sellerProfile ? "En attente d'approbation" : "Accès vendeur requis"}</h2>
            <p className="mt-2 text-surface-400">{sellerProfile ? "Votre profil vendeur est en attente de validation par l'administration." : "Demandez à devenir vendeur pour accéder au tableau de bord."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Dashboard Vendeur</h1>
        <p className="mt-1 text-surface-400">Bienvenue, {sellerProfile.business_name ?? sellerProfile.user_id}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Solde</p>
                <p className="mt-1 text-2xl font-bold text-surface-50">{formatCurrency(stats.currentBalance, "HTG")}</p>
              </div>
              <WalletIcon className="h-8 w-8 text-brand-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Ventes totales</p>
                <p className="mt-1 text-2xl font-bold text-surface-50">{formatCurrency(stats.totalSales.toString(), "HTG")}</p>
              </div>
              <ShoppingBag className="h-8 w-8 text-htg-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Commandes</p>
                <p className="mt-1 text-2xl font-bold text-surface-50">{stats.totalOrders}</p>
              </div>
              <Activity className="h-8 w-8 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Commissions</p>
                <p className="mt-1 text-2xl font-bold text-surface-50">{formatCurrency(stats.totalCommissions.toString(), "HTG")}</p>
              </div>
              <Tag className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/seller/products" className="rounded-lg bg-surface-800 p-4 border border-surface-700 transition-colors hover:border-brand-500/50">
              <p className="text-sm font-semibold text-surface-50">Mes produits</p>
              <p className="text-xs text-surface-400">Voir et gérer vos produits</p>
            </a>
            <a href="/seller/orders" className="rounded-lg bg-surface-800 p-4 border border-surface-700 transition-colors hover:border-brand-500/50">
              <p className="text-sm font-semibold text-surface-50">Mes commandes</p>
              <p className="text-xs text-surface-400">Voir l'historique des commandes</p>
            </a>
            <a href="/seller/wallet" className="rounded-lg bg-surface-800 p-4 border border-surface-700 transition-colors hover:border-brand-500/50">
              <p className="text-sm font-semibold text-surface-50">Portefeuille</p>
              <p className="text-xs text-surface-400">Déposer et gérer votre solde</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}