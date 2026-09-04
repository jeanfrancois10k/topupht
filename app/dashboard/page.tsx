"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { ProtectedRoute } from "@/components/features/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Gamepad2, ShoppingBag, WalletIcon, Gift } from "lucide-react";
import type { Game, Order, Wallet, Notification } from "@/types/shared";

export default function DashboardPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<any | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      if (!profile?.id) return;
      try {
        const [ordersRes, walletRes, gamesRes, promoRes] = await Promise.all([
          supabaseClient.from("orders").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(5),
          supabaseClient.from("wallets").select("*").eq("user_id", profile.id).single(),
          supabaseClient.from("games").select("*").eq("status", "ACTIVE").order("display_order", { ascending: true }).limit(4),
          supabaseClient.from("promotions").select("*").eq("is_active", true),
        ]);
        setOrders((ordersRes.data ?? []) as Order[]);
        setWallet((walletRes.data ?? null) as Wallet | null);
        setGames((gamesRes.data ?? []) as Game[]);
        setPromotions((promoRes.data ?? []) as any[]);
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="mt-1 text-surface-400">Bienvenue, {profile?.full_name ?? profile?.email ?? "Gamer"} !</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Solde</p>
                  <p className="mt-1 text-2xl font-bold text-white">{wallet ? formatCurrency(wallet.balance, wallet.currency as any) : formatCurrency("0")}</p>
                </div>
                <WalletIcon className="h-8 w-8 text-brand-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Commandes</p>
                  <p className="mt-1 text-2xl font-bold text-white">{orders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-htg-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Jeux disponibles</p>
                  <p className="mt-1 text-2xl font-bold text-white">{games.length}</p>
                </div>
                <Gamepad2 className="h-8 w-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Promotions</p>
                  <p className="mt-1 text-2xl font-bold text-white">{promotions.length}</p>
                </div>
                <Gift className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Jeux populaires</CardTitle>
              <CardDescription>Les jeux les plus populaires</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {games.map((game) => (
                  <Link key={game.id} href={`/games/${game.slug}`} className="flex items-center gap-4 rounded-lg bg-surface-800 p-3 transition-colors hover:bg-surface-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700">
                      <Gamepad2 className="h-5 w-5 text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{game.name}</p>
                    </div>
                    <Badge variant="success">Actif</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dernières commandes</CardTitle>
              <CardDescription>Suivez l'état de vos commandes</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="py-8 text-center">
                  <ShoppingBag className="mx-auto h-10 w-10 text-surface-600" />
                  <p className="mt-2 text-sm text-surface-400">Aucune commande pour le moment.</p>
                  <Button variant="outline" className="mt-4">
                    <Link href="/games">Explorer les jeux</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg bg-surface-800 p-3">
                      <div>
                        <p className="text-sm font-medium text-white">{order.order_number}</p>
                        <p className="text-xs text-surface-400">{order.status}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={order.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : order.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}>{order.status}</Badge>
                        <p className="mt-1 text-sm font-medium text-white">{formatCurrency(order.amount, order.currency as any)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {promotions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-yellow-400" />
                Promotions actives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {promotions.map((promo) => (
                  <div key={promo.id} className="rounded-lg bg-surface-800 p-4 border border-surface-700">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">{promo.name}</h4>
                      {promo.code && <Badge variant="warning">{promo.code}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-surface-400">{promo.type} - {promo.value}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}