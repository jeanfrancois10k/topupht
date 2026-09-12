"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { ProtectedRoute } from "@/components/features/auth/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Gamepad2, ShoppingBag, WalletIcon, Gift, ShieldAlert, Package, Plus, Check } from "lucide-react";
import type { Game, Order, Wallet } from "@/types/shared";

export default function DashboardPage() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [wallet, setWallet] = useState<any | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivatingAdmin, setIsActivatingAdmin] = useState(false);
  const [adminActivated, setAdminActivated] = useState(false);

  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN" || profile?.email?.startsWith("admin@");

  useEffect(() => {
    async function fetchDashboard() {
      if (!profile?.id) return;
      try {
        const [ordersRes, walletRes, gamesRes, promoRes] = await Promise.all([
          supabaseClient.from("orders").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(5),
          supabaseClient.from("wallets").select("*").eq("user_id", profile.id).single(),
          supabaseClient.from("games").select("*").eq("is_active", true).order("display_order", { ascending: true }).limit(4),
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

  const handleActivateAdminRole = async () => {
    setIsActivatingAdmin(true);
    try {
      const res = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile?.id, email: profile?.email }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminActivated(true);
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 800);
      } else {
        alert(data.error || "Erreur lors de la mise à jour des droits");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActivatingAdmin(false);
    }
  };

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
        
        {/* Banner Admin pour accès direct et gestion des jeux & services */}
        {isAdmin && (
          <div className="rounded-2xl bg-gradient-to-r from-red-950/80 via-surface-900 to-red-950/80 border border-red-500/40 p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-white">Espace Administrateur Détecté</h2>
                    <Badge variant="danger" className="bg-red-600 text-white font-bold">
                      {profile?.role || "ADMIN"}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-surface-300 mt-0.5">
                    Vous avez accès au panneau de gestion pour ajouter des jeux, abonnements IA (ChatGPT, Claude), modifier les prix et valider les commandes.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Button
                  onClick={() => router.push("/admin/games")}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs h-10 rounded-xl gap-1.5"
                >
                  <Gamepad2 className="h-4 w-4" />
                  + Créer Jeux & Services IA
                </Button>
                <Button
                  onClick={() => router.push("/admin/products")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl gap-1.5"
                >
                  <Package className="h-4 w-4" />
                  + Créer Forfaits & Prix
                </Button>
                <Button
                  onClick={() => router.push("/admin/dashboard")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 rounded-xl shadow-lg"
                >
                  Ouvrir Dashboard Admin
                </Button>
              </div>
            </div>

            {/* If user profile role in DB is still GAMER */}
            {profile?.role !== "SUPER_ADMIN" && profile?.role !== "ADMIN" && (
              <div className="pt-3 border-t border-red-500/20 flex items-center justify-between">
                <p className="text-xs text-red-300">
                  Statut DB actuel: <strong>{profile?.role || "GAMER"}</strong>. Vous pouvez passer ce compte en SuperAdmin en 1 clic :
                </p>
                <Button
                  size="sm"
                  onClick={handleActivateAdminRole}
                  disabled={isActivatingAdmin || adminActivated}
                  className="bg-white text-red-950 font-extrabold text-xs hover:bg-surface-200"
                >
                  {adminActivated ? <Check className="h-4 w-4 mr-1 text-green-600" /> : null}
                  {adminActivated ? "Activé ! Redirection..." : "Activer Rôle SUPER_ADMIN (1 Clic)"}
                </Button>
              </div>
            )}
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold text-surface-50">Tableau de bord</h1>
          <p className="mt-1 text-surface-400">Bienvenue, {profile?.full_name ?? profile?.email ?? "Utilisateur"} !</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Solde</p>
                  <p className="mt-1 text-2xl font-bold text-surface-50">{wallet ? formatCurrency(wallet.balance, wallet.currency as any) : formatCurrency("0")}</p>
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
                  <p className="mt-1 text-2xl font-bold text-surface-50">{orders.length}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-htg-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-surface-400">Jeux & Services</p>
                  <p className="mt-1 text-2xl font-bold text-surface-50">{games.length}</p>
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
                  <p className="mt-1 text-2xl font-bold text-surface-50">{promotions.length}</p>
                </div>
                <Gift className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Jeux & Services Populaires</CardTitle>
              <CardDescription>Consulter les services disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {games.map((game) => (
                  <Link key={game.id} href={`/games/${game.slug}`} className="flex items-center gap-4 rounded-lg bg-surface-800 p-3 transition-colors hover:bg-surface-700">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700">
                      <Gamepad2 className="h-5 w-5 text-brand-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-surface-50">{game.name}</p>
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
                    <Link href="/games">Explorer les jeux & services</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg bg-surface-800 p-3">
                      <div>
                        <p className="text-sm font-medium text-surface-50">{order.order_number}</p>
                        <p className="text-xs text-surface-400">{order.status}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={order.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : order.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}>{order.status}</Badge>
                        <p className="mt-1 text-sm font-medium text-surface-50">{formatCurrency(order.amount, order.currency as any)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}