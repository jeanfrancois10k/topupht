"use client";
// @ts-nocheck
// @ts-nocheck

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { generateId, generateOrderNumber, parseHTG } from "@/lib/utils";
import { ShoppingBag, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  const productId = searchParams.get("product");
  const gameId = searchParams.get("game");

  const [product, setProduct] = useState<any>(null);
  const [playerId, setPlayerId] = useState("");
  const [serverId, setServerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (productId) {
      async function fetchProduct() {
        try {
          const { data, error } = await supabaseClient.from("game_products").select("*").eq("id", productId).eq("status", "ACTIVE").single();
          if (error) throw error;
          setProduct(data);
        } catch {
          setError("Produit introuvable");
        }
      }
      fetchProduct();
    }
  }, [productId]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-surface-700 bg-surface-800">
          <CardContent className="p-8 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-surface-600" />
            <h2 className="mt-4 text-xl font-bold text-white">Connexion requise</h2>
            <p className="mt-2 text-surface-400">Veuillez vous connecter pour effectuer un achat.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !playerId.trim()) {
      setError("Veuillez entrer votre identifiant joueur.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const orderNumber = generateOrderNumber();
      const idempotencyKey = generateId();

      const { data: orderData, error: orderError } = await supabaseClient.from("orders").insert({
        order_number: orderNumber,
        user_id: profile?.id,
        game_id: gameId,
        product_id: product.id,
        player_id: playerId.trim(),
        server_id: serverId.trim() || null,
        amount: product.price_gamer,
        currency: product.currency,
        idempotency_key: idempotencyKey,
        status: "PAYMENT_PENDING",
      } as any).select().single();

      if (orderError) throw orderError;

      // Create payment record
      await supabaseClient.from("payments").insert({
        order_id: (orderData as any)?.id,
        user_id: profile?.id,
        provider_name: "MonCash",
        amount: product.price_gamer,
        currency: product.currency,
        status: "PENDING",
      } as any);

      if (orderData) { router.push(`/orders/${(orderData as any).order_number}`); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de la commande");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Commander</h1>
        <p className="mt-1 text-surface-400">Confirmez votre achat</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-surface-700 bg-surface-800">
          <CardHeader>
            <CardTitle>Détails de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/30 p-3 text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!product ? (
              <div className="py-8 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-surface-600" />
                <p className="mt-2 text-surface-400">Produit non trouvé.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-surface-700 p-3">
                  <div>
                    <p className="text-sm font-medium text-white">{product.name}</p>
                    <p className="text-xs text-surface-400">SKU: {product.sku}</p>
                  </div>
                  <span className="text-lg font-bold text-brand-400">{formatCurrency(product.price_gamer, product.currency)}</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="playerId">Identifiant joueur *</Label>
                    <Input id="playerId" value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder="Ex: 123456789" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="serverId">Serveur (optionnel)</Label>
                    <Input id="serverId" value={serverId} onChange={(e) => setServerId(e.target.value)} placeholder="Ex: ASIA, BRAZIL, EU" className="mt-1" />
                  </div>

                  <div className="rounded-lg bg-surface-700 p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Prix produit</span>
                      <span className="text-white">{formatCurrency(product.price_gamer, product.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-400">Frais de paiement</span>
                      <span className="text-yellow-400">{(parseFloat(product.price_gamer) * 0.025).toFixed(0)} HTG</span>
                    </div>
                    <div className="border-t border-surface-600 pt-2 flex justify-between text-sm font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-brand-400">{formatCurrency((parseFloat(product.price_gamer) * 1.025).toString(), product.currency)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
                    Confirmer la commande
                  </Button>

                  <p className="text-center text-xs text-surface-500">
                    Une fois le paiement confirmé, votre crédit sera livré automatiquement.
                  </p>
                </form>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-surface-700 bg-surface-800">
            <CardHeader>
              <CardTitle>Modes de paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-surface-700 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white text-xs font-bold">MC</div>
                <div>
                  <p className="text-sm font-medium text-white">MonCash</p>
                  <p className="text-xs text-surface-400">Paiement mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-surface-700 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold">NC</div>
                <div>
                  <p className="text-sm font-medium text-white">NatCash</p>
                  <p className="text-xs text-surface-400">Paiement mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-surface-700 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">CC</div>
                <div>
                  <p className="text-sm font-medium text-white">Carte bancaire</p>
                  <p className="text-xs text-surface-400">Visa / Mastercard</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-surface-700 bg-surface-800">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Comment ça marche ?</h3>
              <ol className="space-y-2 text-xs text-surface-400">
                <li className="flex gap-2"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">1</span>Commandez et choisissez votre mode de paiement</li>
                <li className="flex gap-2"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">2</span>Effectuez le paiement</li>
                <li className="flex gap-2"><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">3</span>Recevez votre crédit instantanément</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}