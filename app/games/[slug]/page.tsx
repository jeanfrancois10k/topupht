"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeftIcon, ShoppingCart, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { Game, GameProduct } from "@/types/shared";
import { PromoPopup } from "@/components/features/promotions/promo-popup";

const MOCK_REGIONS = ["USA & Latam", "EU, RU & Bangladesh", "Brazil", "Middle East", "Indonesia"];

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Checkout state
  const [selectedRegion, setSelectedRegion] = useState(MOCK_REGIONS[0]);
  const [selectedProduct, setSelectedProduct] = useState<GameProduct | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchGame() {
      try {
        const [{ data: gameData, error: gameError }, { data: prodData, error: prodError }] = await Promise.all([
          supabaseClient.from("games").select("*").eq("slug", slug).single(),
          supabaseClient.from("game_products").select("*").eq("game_id", (gameData as any)?.id).eq("status", "ACTIVE"),
        ]) as any;
        if (gameError) throw gameError;
        setGame((gameData ?? null) as Game);
        setProducts((prodData ?? []) as GameProduct[]);
        if (prodData && prodData.length > 0) {
          setSelectedProduct(prodData[0] as GameProduct);
        }
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchGame();
  }, [slug]);

  const handleCheckout = () => {
    if (!selectedProduct) return;
    if (!playerId.trim()) {
      alert("Veuillez entrer votre ID de joueur (UID) avant de continuer.");
      return;
    }
    // Proceed to checkout with URL params
    router.push(`/checkout?product=${selectedProduct.id}&game=${game?.id}&uid=${encodeURIComponent(playerId)}&qty=${quantity}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <div className="flex gap-8">
          <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="w-80 shrink-0">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-950">Jeu non trouvé</h2>
          <p className="mt-2 text-surface-500">Ce jeu n'est pas disponible ou a été désactivé.</p>
          <Button variant="outline" className="mt-4 border-surface-200">
            <Link href="/games">Retour aux jeux</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-7xl mx-auto">
      <PromoPopup />
      
      {/* Header Banner */}
      <div className="relative rounded-2xl border border-surface-200 bg-surface-50 overflow-hidden shadow-sm">
        {game.banner_url && (
          <div className="absolute inset-0 opacity-20">
            <img src={game.banner_url} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex h-24 w-24 md:h-32 md:w-32 shrink-0 items-center justify-center rounded-2xl bg-white shadow-md border border-surface-100 overflow-hidden">
            {game.logo_url ? (
              <img src={game.logo_url} alt={game.name} className="h-full w-full object-contain p-2" />
            ) : (
              <ShoppingCart className="h-12 w-12 text-surface-300" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-extrabold text-surface-950">{game.name} Recharge</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <Badge variant="warning" className="bg-htg-100 text-htg-700 border-htg-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Rapide
              </Badge>
              <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Sécurisé
              </Badge>
              <Badge variant="outline" className="bg-brand-50 text-brand-700 border-brand-200">
                <CheckCircle2 className="h-3 w-3 mr-1" /> 24/7
              </Badge>
            </div>
            {game.description && <p className="mt-4 text-sm text-surface-600 max-w-2xl">{game.description}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Products */}
        <div className="flex-1 space-y-6">
          {/* Mock Regions / Servers Info */}
          <div className="rounded-xl border border-htg-200 bg-orange-50/50 p-4">
            <p className="text-sm font-medium text-surface-800">
              Assurez-vous de sélectionner la région correspondant à votre compte pour éviter les échecs de recharge.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {MOCK_REGIONS.map(region => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                  selectedRegion === region 
                    ? "bg-white border-htg-500 text-htg-600 shadow-sm" 
                    : "bg-surface-50 border-surface-200 text-surface-600 hover:bg-surface-100"
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-12 text-center">
              <p className="text-surface-500">Aucun produit disponible dans cette région.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((product) => {
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`relative flex flex-col text-left overflow-hidden rounded-xl border bg-white p-4 transition-all hover:-translate-y-1 ${
                      isSelected 
                        ? "border-htg-500 ring-1 ring-htg-500 shadow-md" 
                        : "border-surface-200 hover:border-htg-300 shadow-sm"
                    }`}
                  >
                    {/* Mock Discount Badge */}
                    <div className="absolute top-0 right-0 bg-brand-50 text-brand-600 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-b border-l border-brand-100">
                      -5%
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center items-center py-2">
                      {/* Placeholder for Product Icon (e.g. Diamond) */}
                      <div className="h-10 w-10 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mb-2">
                        💎
                      </div>
                      <h3 className="text-sm font-bold text-surface-950 text-center leading-tight">{product.name}</h3>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-surface-100 w-full text-center">
                      <span className="text-lg font-black text-htg-600">{formatCurrency(product.price_gamer, product.currency as any)}</span>
                      <div className="text-[10px] text-surface-400 line-through">
                        {formatCurrency(Number(product.price_gamer) * 1.05, product.currency as any)}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[24px] border-l-transparent border-b-[24px] border-b-htg-500 flex items-end justify-end">
                        <CheckCircle2 className="h-3 w-3 text-white absolute -left-4 top-2" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Sidebar */}
        <div className="w-full lg:w-[340px] shrink-0">
          <div className="sticky top-20 rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
            <div className="bg-surface-50 px-6 py-4 border-b border-surface-200">
              <h2 className="text-lg font-bold text-surface-950">Informations de commande</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* UID Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-950 flex items-center gap-1">
                  * ID de Joueur (UID)
                  <Info className="h-3 w-3 text-surface-400" />
                </label>
                <input 
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="Ex: 123456789"
                  className="w-full rounded-lg border border-surface-300 px-3 py-2 text-sm focus:border-htg-500 focus:outline-none focus:ring-1 focus:ring-htg-500"
                />
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-surface-950">Quantité</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-l-lg border border-surface-300 bg-surface-50 hover:bg-surface-100"
                  >-</button>
                  <input 
                    type="number"
                    value={quantity}
                    readOnly
                    className="h-8 w-16 border-y border-surface-300 text-center text-sm font-medium"
                  />
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-r-lg border border-surface-300 bg-surface-50 hover:bg-surface-100"
                  >+</button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t border-surface-200 pt-4 mt-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm font-medium text-surface-600">Total :</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-htg-600">
                      {selectedProduct ? formatCurrency(Number(selectedProduct.price_gamer) * quantity, selectedProduct.currency as any) : "0.00 HTG"}
                    </div>
                    {selectedProduct && (
                      <div className="text-xs text-brand-500 font-medium">
                        Économisez {formatCurrency(Number(selectedProduct.price_gamer) * 0.05 * quantity, selectedProduct.currency as any)} &gt;
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                disabled={!selectedProduct || !playerId.trim()}
                className="w-full bg-htg-500 hover:bg-htg-600 text-white font-bold h-12 text-lg rounded-xl shadow-md disabled:opacity-50"
              >
                Recharger maintenant
              </Button>
              
              <div className="flex justify-center mt-4 opacity-50 grayscale">
                {/* Mock payment methods logos */}
                <div className="flex gap-2">
                  <div className="h-6 w-10 bg-surface-200 rounded"></div>
                  <div className="h-6 w-10 bg-surface-200 rounded"></div>
                  <div className="h-6 w-10 bg-surface-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}