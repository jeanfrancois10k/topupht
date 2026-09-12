"use client";
// @ts-nocheck


import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, generateId, generateOrderNumber } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, AlertCircle, Wallet as WalletIcon, Smartphone, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Wallet } from "@/types/shared";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  
  const productId = searchParams.get("product");
  const gameId = searchParams.get("game");
  const initialUid = searchParams.get("uid") || "";
  const initialQty = parseInt(searchParams.get("qty") || "1", 10);

  const [product, setProduct] = useState<any>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  
  const [playerId, setPlayerId] = useState(initialUid);
  const [quantity, setQuantity] = useState(initialQty);
  
  const [paymentMethod, setPaymentMethod] = useState<"WALLET" | "MANUAL_MONCASH">("WALLET");
  const [moncashReference, setMoncashReference] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [orderNum, setOrderNum] = useState("");

  // Fetch product and wallet
  useEffect(() => {
    if (productId) {
      async function fetchData() {
        try {
          const { data, error } = await supabaseClient.from("game_products").select("*").eq("id", productId).eq("status", "ACTIVE").single();
          if (error) throw error;
          setProduct(data);
          
          if (profile?.id) {
            const { data: walletData } = await supabaseClient.from("wallets").select("*").eq("user_id", profile.id).single();
            if (walletData) setWallet(walletData as Wallet);
          }
        } catch {
          setError("Produit introuvable");
        }
      }
      fetchData();
    }
  }, [productId, profile?.id]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-htg-300" />
            <h2 className="mt-4 text-2xl font-bold text-surface-950">Connexion requise</h2>
            <p className="mt-2 text-surface-500">Veuillez vous connecter pour effectuer un achat.</p>
            <Button className="mt-6 w-full bg-htg-500 hover:bg-htg-600 font-bold" onClick={() => router.push('/auth/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPrice = product ? parseFloat(product.price_gamer) * quantity : 0;
  const canAffordWithWallet = wallet && parseFloat(wallet.balance) >= totalPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !playerId.trim()) {
      setError("Veuillez entrer votre identifiant joueur (UID).");
      return;
    }
    
    if (paymentMethod === "WALLET" && !canAffordWithWallet) {
      setError("Solde insuffisant. Veuillez recharger votre compte chez un marchand ou utiliser MonCash manuel.");
      return;
    }

    if (paymentMethod === "MANUAL_MONCASH" && !moncashReference.trim()) {
      setError("Veuillez entrer le numéro de référence du transfert MonCash.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const orderNumber = generateOrderNumber();
      const idempotencyKey = generateId();

      const orderStatus = paymentMethod === "WALLET" ? "PROCESSING" : "PAYMENT_PENDING";

      // 1. Create Order
      const { data: orderData, error: orderError } = await supabaseClient.from("orders").insert({
        order_number: orderNumber,
        user_id: profile?.id,
        game_id: gameId,
        product_id: product.id,
        player_id: playerId.trim(),
        amount: totalPrice.toString(),
        currency: product.currency,
        idempotency_key: idempotencyKey,
        status: orderStatus,
        payment_method: paymentMethod,
        notes: paymentMethod === "MANUAL_MONCASH" ? `Reference MonCash: ${moncashReference}` : null
      } as any).select().single();

      if (orderError) throw orderError;

      // 2. If Wallet, deduct balance (In a real app, this should be done via a secure RPC call)
      if (paymentMethod === "WALLET" && wallet) {
        const newBalance = parseFloat(wallet.balance) - totalPrice;
        await (supabaseClient.from("wallets") as any).update({ balance: newBalance.toString() }).eq("id", wallet.id);
        
        await supabaseClient.from("wallet_transactions").insert({
          wallet_id: wallet.id,
          user_id: profile?.id,
          type: "PURCHASE",
          amount: totalPrice.toString(),
          balance_before: wallet.balance,
          balance_after: newBalance.toString(),
          reference: orderNumber,
          description: `Achat de ${quantity}x ${product.name}`,
        } as any);

        // Auto-fulfill order via API
        fetch('/api/orders/fulfill', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: (orderData as any).id })
        }).catch(err => console.error("Fulfillment trigger failed:", err));
      }

      setOrderNum(orderNumber);
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border-green-200 shadow-xl overflow-hidden">
          <div className="bg-green-500 h-2 w-full"></div>
          <CardContent className="p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-surface-950 mb-2">Commande {paymentMethod === "WALLET" ? "Réussie" : "En attente"} !</h2>
            <p className="text-surface-500 mb-6">
              Numéro de commande : <span className="font-bold text-surface-900">{orderNum}</span>
            </p>
            
            {paymentMethod === "MANUAL_MONCASH" ? (
              <div className="bg-orange-50 text-orange-800 p-4 rounded-xl text-sm mb-6 border border-orange-100 text-left">
                <p className="font-bold mb-2">Que se passe-t-il maintenant ?</p>
                <p>Notre équipe va vérifier la réception de votre transfert MonCash avec la référence fournie. Votre compte de jeu sera rechargé dans les 15 à 30 minutes suivant la vérification.</p>
              </div>
            ) : (
              <div className="bg-green-50 text-green-800 p-4 rounded-xl text-sm mb-6 border border-green-100 text-left">
                <p className="font-bold mb-2">Paiement validé !</p>
                <p>Votre paiement par solde a été déduit. La recharge de votre compte de jeu est en cours de traitement et devrait arriver d'une minute à l'autre.</p>
              </div>
            )}
            
            <Button className="w-full bg-surface-950 text-white font-bold h-12" onClick={() => router.push(`/orders`)}>
              Voir mes commandes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-surface-950">Finaliser l'achat</h1>
        <p className="mt-1 text-surface-500">Choisissez votre méthode de paiement pour recharger votre compte de jeu.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          <Card className="bg-white border-surface-200 shadow-sm">
            <CardHeader className="bg-surface-50 border-b border-surface-200">
              <CardTitle className="text-lg">Choix du paiement</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              
              {/* Wallet Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("WALLET")}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === "WALLET" ? "border-htg-500 bg-orange-50/50" : "border-surface-200 hover:border-htg-300"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 shrink-0">
                  <WalletIcon className="h-6 w-6 text-htg-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-surface-950">Payer avec le Solde (Recommandé)</h3>
                  <p className="text-sm text-surface-500">Solde actuel : <span className="font-bold text-surface-900">{wallet ? formatCurrency(wallet.balance, wallet.currency as any) : "0 HTG"}</span></p>
                </div>
                {paymentMethod === "WALLET" && <CheckCircle2 className="h-6 w-6 text-htg-500 shrink-0" />}
              </button>

              {/* Manual Moncash Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod("MANUAL_MONCASH")}
                className={`w-full flex items-center p-4 rounded-xl border-2 transition-all text-left ${
                  paymentMethod === "MANUAL_MONCASH" ? "border-red-500 bg-red-50" : "border-surface-200 hover:border-red-300"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 shrink-0">
                  <Smartphone className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-bold text-surface-950">MonCash (Transfert Manuel)</h3>
                  <p className="text-sm text-surface-500">Envoyez l'argent à l'un de nos agents</p>
                </div>
                {paymentMethod === "MANUAL_MONCASH" && <CheckCircle2 className="h-6 w-6 text-red-500 shrink-0" />}
              </button>

              {paymentMethod === "MANUAL_MONCASH" && (
                <div className="mt-4 p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="text-sm text-surface-600">
                    <p className="font-semibold text-surface-950 mb-2">Instructions :</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Envoyez exactement <strong className="text-red-600">{formatCurrency(totalPrice.toString(), product?.currency)}</strong> au numéro suivant :</li>
                      <div className="my-2 p-3 bg-white rounded-lg border border-surface-200 font-mono text-lg font-bold text-center text-surface-950">
                        +509 3X XX XX XX (Marchand Officiel)
                      </div>
                      <li>Une fois envoyé, repérez le numéro de référence (Trans ID) dans le SMS de confirmation MonCash.</li>
                      <li>Entrez ce numéro ci-dessous pour validation.</li>
                    </ol>
                  </div>
                  <div>
                    <Label htmlFor="ref">Numéro de référence MonCash</Label>
                    <Input 
                      id="ref" 
                      placeholder="Ex: 1234567890" 
                      value={moncashReference}
                      onChange={(e) => setMoncashReference(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white border-surface-200 shadow-sm sticky top-20">
            <CardHeader className="bg-surface-50 border-b border-surface-200">
              <CardTitle className="text-lg">Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-600 text-sm font-medium border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!product ? (
                <div className="py-8 text-center">
                  <Spinner />
                  <p className="mt-2 text-surface-500">Chargement...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-surface-950">{product.name}</p>
                      <p className="text-xs text-surface-500">Quantité : {quantity}</p>
                    </div>
                    <span className="font-bold text-surface-900">{formatCurrency(totalPrice.toString(), product.currency)}</span>
                  </div>

                  <div>
                    <Label htmlFor="playerId" className="text-surface-950 font-bold">UID du joueur (Vérifiez bien !)</Label>
                    <Input 
                      id="playerId" 
                      value={playerId} 
                      onChange={(e) => setPlayerId(e.target.value)} 
                      placeholder="Ex: 123456789" 
                      required 
                      className="mt-1 border-surface-300 focus:border-htg-500" 
                    />
                  </div>

                  <div className="pt-4 border-t border-surface-200">
                    <div className="flex justify-between items-end">
                      <span className="font-semibold text-surface-600">Total à payer</span>
                      <span className="text-3xl font-black text-htg-600">{formatCurrency(totalPrice.toString(), product.currency)}</span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleSubmit} 
                    className="w-full bg-surface-950 text-white hover:bg-surface-800 font-bold h-12 text-lg rounded-xl shadow-lg" 
                    disabled={isLoading}
                  >
                    {isLoading ? <Spinner className="mr-2" /> : "Payer la commande"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}