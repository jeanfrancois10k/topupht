"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft, ShieldCheck, Gamepad2, Trophy, Star, Sword,
  Lock, CheckCircle2, Clock, User, AlertTriangle, Calendar
} from "lucide-react";
import Link from "next/link";

export default function GameAccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [account, setAccount] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [rentalDays, setRentalDays] = useState(1);

  const accountId = params?.id as string;

  useEffect(() => {
    if (!accountId) return;
    fetchAccount();
    if (isAuthenticated && user) fetchWallet();
  }, [accountId, isAuthenticated, user]);

  async function fetchAccount() {
    const { data, error } = await supabaseClient
      .from("game_accounts")
      .select("*, games(name, logo_url), profiles(full_name, avatar_url)")
      .eq("id", accountId)
      .eq("status", "ACTIVE")
      .single();
    if (error || !data) { setError("Compte introuvable."); setIsLoading(false); return; }
    setAccount(data);
    setIsLoading(false);
  }

  async function fetchWallet() {
    const { data } = await supabaseClient.from("wallets").select("balance").eq("user_id", user.id).single();
    if (data) setWalletBalance(parseFloat(data.balance || "0"));
  }

  const totalPrice = account?.type === "RENTAL"
    ? parseFloat(account?.rental_price_per_day || "0") * rentalDays
    : parseFloat(account?.price || "0");

  async function handlePurchase() {
    if (!isAuthenticated) { router.push("/auth/login"); return; }
    if (walletBalance < totalPrice) { setError(`Solde insuffisant. Votre solde: ${formatCurrency(String(walletBalance), "HTG")}`); return; }

    setIsPurchasing(true);
    setError(null);

    try {
      const commission = totalPrice * 0.1;
      const sellerAmount = totalPrice - commission;

      // Create order
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          order_number: `GA-${Date.now()}`,
          user_id: user.id,
          game_id: account.game_id,
          amount: String(totalPrice),
          currency: account.currency,
          status: "PAID",
          payment_method: "WALLET",
          merchant_id: account.seller_id,
          metadata: {
            type: account.type === "RENTAL" ? "account_rental" : "account_purchase",
            account_id: account.id,
            account_title: account.title,
            rental_days: account.type === "RENTAL" ? rentalDays : null,
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Escrow hold
      await (supabaseClient as any).from("escrow_holds").insert({
        buyer_id: user.id,
        seller_id: account.seller_id,
        account_id: account.id,
        amount: String(totalPrice),
        platform_fee: String(commission.toFixed(2)),
        seller_amount: String(sellerAmount.toFixed(2)),
        currency: account.currency,
        status: "HELD",
      });

      // If rental, create rental record
      if (account.type === "RENTAL") {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + rentalDays);
        await (supabaseClient as any).from("account_rentals").insert({
          account_id: account.id,
          buyer_id: user.id,
          seller_id: account.seller_id,
          end_date: endDate.toISOString(),
          days: rentalDays,
          daily_price: account.rental_price_per_day,
          total_price: String(totalPrice),
          currency: account.currency,
          status: "ACTIVE",
        });
        // Keep account active during rental (mark as RENTED)
        await supabaseClient.from("game_accounts").update({ status: "RENTED" }).eq("id", account.id);
      } else {
        await supabaseClient.from("game_accounts").update({ status: "SOLD" }).eq("id", account.id);
      }

      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'achat.");
    } finally {
      setIsPurchasing(false);
    }
  }

  if (isLoading) return <div className="flex justify-center py-16"><Spinner className="h-10 w-10 text-htg-500" /></div>;

  if (error && !account) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-amber-400 mb-4" />
        <h1 className="text-2xl font-bold">Compte introuvable</h1>
        <Link href="/marketplace/accounts"><Button className="mt-6" variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Retour</Button></Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-10">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-black text-green-800">
            {account.type === "RENTAL" ? "Location confirmée !" : "Achat réussi !"}
          </h1>
          <p className="mt-3 text-green-700 text-lg">
            Votre paiement de <strong>{formatCurrency(String(totalPrice), account.currency)}</strong> est sécurisé.
            {account.type === "RENTAL"
              ? ` L'admin vous donnera accès au compte pour ${rentalDays} jour(s) sous 24h.`
              : " L'admin vous livrera les identifiants sous 24h."}
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/orders"><Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full">Voir mes commandes</Button></Link>
            <Link href="/marketplace/accounts"><Button variant="outline" className="rounded-full">Continuer</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <Link href="/marketplace/accounts" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Retour au Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <Card className="overflow-hidden border-surface-200">
            <div className="bg-gradient-to-r from-surface-950 to-surface-800 p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                {account.games?.logo_url
                  ? <img src={account.games.logo_url} alt="" className="h-10 w-10 object-contain" />
                  : <Gamepad2 className="h-8 w-8 text-white" />}
              </div>
              <div className="flex-1">
                <p className="text-surface-400 text-xs font-bold uppercase">{account.games?.name}</p>
                <h1 className="text-xl font-black text-white leading-tight">{account.title}</h1>
              </div>
              <Badge className={`font-bold border ${account.type === "SALE" ? "bg-green-500/20 text-green-300 border-green-500/30" : "bg-blue-500/20 text-blue-300 border-blue-500/30"}`}>
                {account.type === "SALE" ? "💰 Vente" : "⏱️ Location"}
              </Badge>
            </div>
            <CardContent className="p-6">
              <p className="text-surface-600 leading-relaxed">{account.description || "Pas de description."}</p>

              {/* Stats grid */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {account.rank && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                    <Trophy className="h-5 w-5 text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-surface-400">Rang</p>
                    <p className="font-bold text-amber-700">{account.rank}</p>
                  </div>
                )}
                {account.level && (
                  <div className="bg-surface-50 border border-surface-200 rounded-xl p-3 text-center">
                    <Star className="h-5 w-5 text-surface-500 mx-auto mb-1" />
                    <p className="text-xs text-surface-400">Niveau</p>
                    <p className="font-bold text-surface-700">{account.level}</p>
                  </div>
                )}
                {account.skins_count > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-center">
                    <Star className="h-5 w-5 text-purple-500 mx-auto mb-1" />
                    <p className="text-xs text-surface-400">Skins</p>
                    <p className="font-bold text-purple-700">{account.skins_count}</p>
                  </div>
                )}
                {account.heroes_count > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                    <Sword className="h-5 w-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-xs text-surface-400">Héros</p>
                    <p className="font-bold text-blue-700">{account.heroes_count}</p>
                  </div>
                )}
              </div>

              {/* Highlights */}
              {account.highlights?.length > 0 && (
                <div className="mt-5">
                  <p className="font-bold text-surface-900 mb-2">✨ Points forts</p>
                  <div className="flex flex-wrap gap-2">
                    {account.highlights.map((h: string, i: number) => (
                      <span key={i} className="bg-htg-50 border border-htg-200 text-htg-700 text-xs font-semibold rounded-full px-3 py-1">
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
            <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-blue-900">Transaction 100% Sécurisée par TOPUP+</p>
              <p className="text-sm text-blue-700 mt-1">
                Votre argent est bloqué jusqu'à livraison des identifiants. L'admin vérifie le compte avant tout transfert. Remboursement garanti si problème.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Purchase */}
        <div>
          <Card className="border-htg-200 shadow-lg sticky top-6">
            <CardContent className="p-6 space-y-5">
              {/* Price */}
              <div className="text-center">
                {account.type === "SALE" ? (
                  <>
                    <p className="text-sm text-surface-400">Prix de vente</p>
                    <p className="text-4xl font-black text-htg-600 mt-1">{formatCurrency(account.price, account.currency)}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-surface-400">Location</p>
                    <p className="text-3xl font-black text-blue-600 mt-1">
                      {formatCurrency(account.rental_price_per_day, account.currency)}
                      <span className="text-base font-normal text-surface-400">/jour</span>
                    </p>
                  </>
                )}
              </div>

              {/* Rental days picker */}
              {account.type === "RENTAL" && (
                <div>
                  <Label className="font-semibold text-sm">Durée de location</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => setRentalDays(Math.max(account.min_rental_days || 1, rentalDays - 1))} className="h-9 w-9 rounded-lg border border-surface-200 flex items-center justify-center font-bold text-surface-600 hover:bg-surface-50">-</button>
                    <span className="flex-1 text-center font-bold text-lg">{rentalDays} jour{rentalDays > 1 ? "s" : ""}</span>
                    <button onClick={() => setRentalDays(rentalDays + 1)} className="h-9 w-9 rounded-lg border border-surface-200 flex items-center justify-center font-bold text-surface-600 hover:bg-surface-50">+</button>
                  </div>
                  <div className="mt-3 flex justify-between items-center bg-blue-50 rounded-xl p-3 text-sm">
                    <span className="text-blue-700 font-medium">Total</span>
                    <span className="font-black text-blue-700 text-lg">{formatCurrency(String(totalPrice), account.currency)}</span>
                  </div>
                </div>
              )}

              {/* Seller */}
              <div className="flex items-center gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                <div className="h-9 w-9 rounded-full bg-surface-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-surface-500" />
                </div>
                <div>
                  <p className="text-xs text-surface-400">{account.type === "SALE" ? "Vendu" : "Loué"} par</p>
                  <p className="font-semibold text-surface-900 text-sm">{account.profiles?.full_name || "Vendeur anonyme"}</p>
                </div>
              </div>

              {/* Balance */}
              {isAuthenticated && (
                <div className="flex justify-between text-sm bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <span className="text-surface-400">Votre solde</span>
                  <span className={`font-bold ${walletBalance >= totalPrice ? "text-green-600" : "text-red-500"}`}>
                    {formatCurrency(String(walletBalance), "HTG")}
                  </span>
                </div>
              )}

              {error && <Alert variant="destructive"><AlertDescription className="text-sm">{error}</AlertDescription></Alert>}

              {isAuthenticated ? (
                <>
                  {walletBalance < totalPrice && (
                    <Link href="/wallet/deposit">
                      <Button variant="outline" className="w-full border-htg-300 text-htg-600 hover:bg-htg-50 font-bold rounded-xl">
                        Recharger mon portefeuille
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchasing || walletBalance < totalPrice}
                    className="w-full bg-htg-500 hover:bg-htg-600 text-white font-black text-lg h-14 rounded-xl shadow-lg shadow-htg-500/20"
                  >
                    {isPurchasing ? <Spinner className="h-5 w-5" /> : (
                      <><ShieldCheck className="mr-2 h-5 w-5" />{account.type === "SALE" ? "Acheter" : "Louer"} — {formatCurrency(String(totalPrice), account.currency)}</>
                    )}
                  </Button>
                  <p className="text-xs text-surface-400 text-center">🔒 Paiement sécurisé. Remboursé si problème.</p>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button className="w-full bg-htg-500 hover:bg-htg-600 text-white font-bold h-12 rounded-xl">
                    Se connecter pour {account.type === "SALE" ? "acheter" : "louer"}
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <Clock className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">Livraison sous 24h</p>
              <p className="text-xs text-amber-700 mt-0.5">Les identifiants sont transmis après vérification admin.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
