"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, ShoppingBag, Users, Store, Wallet } from "lucide-react";

interface ReportStats {
  total_orders: number;
  successful_orders: number;
  total_revenue: string;
  total_users: number;
  total_sellers: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data: orders }, { data: successfulOrders }, { data: users }, { data: sellers }, { data: revenue }] = await Promise.all([
          supabaseClient.from("orders").select("id", { count: "exact", head: true }),
          supabaseClient.from("orders").select("id", { count: "exact", head: true }).eq("status", "SUCCESS"),
          supabaseClient.from("profiles").select("id", { count: "exact", head: true }),
          supabaseClient.from("seller_profiles").select("id", { count: "exact", head: true }),
          supabaseClient.from("orders").select("amount", { count: "exact", head: true }).eq("status", "SUCCESS"),
        ]);

        const totalRevenue = revenue?.reduce((sum: number, o: { amount: string }) => sum + parseFloat(o.amount), 0) || 0;
        setStats({
          total_orders: orders?.length ?? 0,
          successful_orders: successfulOrders?.length ?? 0,
          total_revenue: totalRevenue.toFixed(2),
          total_users: users?.length ?? 0,
          total_sellers: sellers?.length ?? 0,
        });
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "Total commandes", value: stats?.total_orders, icon: ShoppingBag, color: "text-htg-400" },
    { label: "Commandes réussies", value: stats?.successful_orders, icon: ShoppingBag, color: "text-green-400" },
    { label: "Revenus", value: stats?.total_revenue ? formatCurrency(stats.total_revenue) : "0 HTG", icon: Wallet, color: "text-yellow-400" },
    { label: "Utilisateurs", value: stats?.total_users, icon: Users, color: "text-brand-400" },
    { label: "Vendeurs", value: stats?.total_sellers, icon: Store, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Rapports</h1>
        <p className="mt-1 text-surface-400">Vue d'ensemble des statistiques</p>
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
    </div>
  );
}