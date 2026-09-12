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
import {
  ShieldCheck, Gamepad2, User, ArrowLeft, AlertTriangle,
  Lock, CheckCircle2, Star, Clock
} from "lucide-react";
import Link from "next/link";

export default function MarketplaceListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const listingId = params?.id as string;

  useEffect(() => {
    if (!listingId) return;
    fetchListing();
    if (isAuthenticated && user) fetchWallet();
  }, [listingId, isAuthenticated, user]);

  async function fetchListing() {
    try {
      const { data, error } = await supabaseClient
        .from("marketplace_listings")
        .select("*, games(name, logo_url), profiles(full_name, avatar_url)")
        .eq("id", listingId)
        .eq("status", "ACTIVE")
        .single();

      if (error || !data) {
        setError("Annonce introuvable ou plus disponible.");
        return;
      }
      setListing(data);
    } catch (e) {
      setError("Erreur de chargement.");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchWallet() {
    const { data } = await supabaseClient
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();
    if (data) setWalletBalance(parseFloat(data.balance || "0"));
  }

  async function handlePurchase() {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    const price = parseFloat(listing.price);
    if (walletBalance < price) {
      setError(`Solde insuffisant. Votre solde: ${formatCurrency(String(walletBalance), "HTG")}. Rechargez votre portefeuille.`);
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      // Create the order
      const orderNumber = `MKT-${Date.now()}`;
      const commission = price * 0.1;
      const sellerAmount = price - commission;

      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: user.id,
          game_id: listing.game_id,
          amount: listing.price,
          currency: listing.currency,
          status: "PAID",
          payment_method: "WALLET",
          listing_id: listing.id,
          merchant_id: listing.seller_id,
          metadata: {
            type: "marketplace_purchase",
            listing_title: listing.title,
            listing_type: listing.type,
          }
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create escrow hold
      await (supabaseClient as any).from("escrow_holds").insert({
        buyer_id: user.id,
        seller_id: listing.seller_id,
        listing_id: listing.id,
        amount: listing.price,
        platform_fee: String(commission.toFixed(2)),
        seller_amount: String(sellerAmount.toFixed(2)),
        currency: listing.currency,
        status: "HELD",
      });

      // Mark listing as sold (pending admin delivery)
      await supabaseClient
        .from("marketplace_listings")
        .update({ status: "SOLD" })
        .eq("id", listing.id);

      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de l'achat. Réessayez.");
    } finally {
      setIsPurchasing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner className="h-10 w-10 text-htg-500" />
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <AlertTriangle className="mx-auto h-16 w-16 text-amber-400 mb-4" />
        <h1 className="text-2xl font-bold text-surface-950">Annonce introuvable</h1>
        <p className="text-surface-500 mt-2">{error}</p>
        <Link href="/marketplace">
          <Button className="mt-6" variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Marketplace
          </Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-green-50 border border-green-200 rounded-3xl p-10">
          <CheckCircle2 className="mx-auto h-20 w-20 text-green-500 mb-4" />
          <h1 className="text-3xl font-black text-green-800">Achat réussi !</h1>
          <p className="mt-3 text-green-700 text-lg">
            Votre paiement est sécurisé. L'admin va contacter le vendeur et vous livrer les identifiants sous <strong>24h</strong>.
          </p>
          <div className="mt-6 bg-white border border-green-200 rounded-2xl p-4 text-left space-y-2">
            <p className="text-sm text-surface-600">📦 <strong>Annonce :</strong> {listing?.title}</p>
            <p className="text-sm text-surface-600">💰 <strong>Montant payé :</strong> {formatCurrency(listing?.price, listing?.currency)}</p>
            <p className="text-sm text-surface-600">🔒 <strong>Statut :</strong> Argent sécurisé (Escrow)</p>
          </div>
          <div className="mt-6 flex gap-3 justify-center">
            <Link href="/orders">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-full">
                Voir mes commandes
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" className="rounded-full">
                Continuer à explorer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Back */}
      <Link href="/marketplace" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 transition-colors text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Retour au Marketplace
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Listing details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header */}
          <Card className="overflow-hidden border-surface-200">
            <div className="bg-gradient-to-r from-surface-950 to-surface-800 p-6 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                {listing?.games?.logo_url ? (
                  <img src={listing.games.logo_url} alt="" className="h-10 w-10 object-contain" />
                ) : (
                  <Gamepad2 className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <p className="text-surface-400 text-xs font-bold uppercase tracking-wider">{listing?.games?.name}</p>
                <h1 className="text-2xl font-black text-white leading-tight">{listing?.title}</h1>
              </div>
              <Badge className="ml-auto bg-htg-500/20 text-htg-300 border-htg-500/30 font-bold">
                {listing?.type === "ACCOUNT" ? "Compte" : listing?.type === "CURRENCY" ? "Devises" : "Objet"}
              </Badge>
            </div>
            <CardContent className="p-6">
              <p className="text-surface-600 leading-relaxed">{listing?.description || "Aucune description fournie."}</p>
            </CardContent>
          </Card>

          {/* Security info */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
            <ShieldCheck className="h-8 w-8 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900">Transaction 100% Sécurisée</p>
              <p className="text-sm text-blue-700 mt-1">
                Votre argent est <strong>bloqué</strong> jusqu'à réception des identifiants. L'admin vérifie le compte avant de vous livrer les accès. En cas de problème, vous êtes remboursé intégralement.
              </p>
            </div>
          </div>

          {/* Process steps */}
          <Card className="border-surface-200">
            <CardHeader>
              <CardTitle className="text-lg">Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { step: "1", icon: Lock, label: "Votre paiement est sécurisé", desc: "L'argent est bloqué dans notre système Escrow" },
                { step: "2", icon: User, label: "L'admin contacte le vendeur", desc: "Récupération des identifiants du compte" },
                { step: "3", icon: ShieldCheck, label: "Vérification du compte", desc: "On vérifie que le compte correspond à l'annonce" },
                { step: "4", icon: CheckCircle2, label: "Livraison à l'acheteur", desc: "Vous recevez les identifiants, le vendeur est payé" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-htg-500 text-white flex items-center justify-center text-sm font-black shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900">{item.label}</p>
                    <p className="text-sm text-surface-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Purchase card */}
        <div className="space-y-4">
          <Card className="border-htg-200 bg-gradient-to-b from-white to-htg-50/30 shadow-lg sticky top-6">
            <CardContent className="p-6 space-y-5">
              {/* Price */}
              <div className="text-center">
                <p className="text-sm text-surface-500 font-medium">Prix sécurisé</p>
                <p className="text-4xl font-black text-htg-600 mt-1">
                  {formatCurrency(listing?.price, listing?.currency)}
                </p>
              </div>

              {/* Seller info */}
              <div className="flex items-center gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                <div className="h-9 w-9 rounded-full bg-surface-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-surface-500" />
                </div>
                <div>
                  <p className="text-xs text-surface-400">Vendu par</p>
                  <p className="font-semibold text-surface-900 text-sm">
                    {listing?.profiles?.full_name || "Vendeur anonyme"}
                  </p>
                </div>
              </div>

              {/* Wallet balance */}
              {isAuthenticated && (
                <div className="flex justify-between items-center text-sm bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <span className="text-surface-500">Votre solde</span>
                  <span className={`font-bold ${walletBalance >= parseFloat(listing?.price || "0") ? "text-green-600" : "text-red-500"}`}>
                    {formatCurrency(String(walletBalance), "HTG")}
                  </span>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="text-sm">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isAuthenticated ? (
                <>
                  {walletBalance < parseFloat(listing?.price || "0") && (
                    <Link href="/wallet">
                      <Button variant="outline" className="w-full border-htg-300 text-htg-600 hover:bg-htg-50 font-bold rounded-xl">
                        Recharger mon portefeuille
                      </Button>
                    </Link>
                  )}
                  <Button
                    onClick={handlePurchase}
                    disabled={isPurchasing || walletBalance < parseFloat(listing?.price || "0")}
                    className="w-full bg-htg-500 hover:bg-htg-600 text-white font-black text-lg h-14 rounded-xl shadow-lg shadow-htg-500/20"
                  >
                    {isPurchasing ? <Spinner className="h-5 w-5" /> : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        Acheter maintenant
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-surface-400 text-center">
                    🔒 Paiement sécurisé. Remboursé si problème.
                  </p>
                </>
              ) : (
                <Link href="/auth/login">
                  <Button className="w-full bg-htg-500 hover:bg-htg-600 text-white font-bold h-12 rounded-xl">
                    Se connecter pour acheter
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Delivery time */}
          <Card className="border-surface-200 bg-amber-50">
            <CardContent className="p-4 flex gap-3 items-start">
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 text-sm">Délai de livraison</p>
                <p className="text-xs text-amber-700 mt-0.5">Les identifiants sont livrés sous <strong>24h</strong> après confirmation du paiement.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
