"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeftIcon, ShoppingCart, Info, CheckCircle2, Clock, ShieldCheck, ChevronDown, Tag } from "lucide-react";
import Link from "next/link";
import type { Game, GameProduct } from "@/types/shared";
import { PromoPopup } from "@/components/features/promotions/promo-popup";

const REGIONS = [
  "Sauf ID-VN-IN-TH-LAM-MENA",
  "LAM (Amérique latine)",
  "Moyen-Orient et Afrique du Nord",
  "UE (Europe)",
  "SG/MY/PH/KH",
  "ID (Indonésie)",
  "TH (Thaïlande)",
  "BR (Brésil)",
];

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Checkout state
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  const [selectedProduct, setSelectedProduct] = useState<GameProduct | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    async function fetchGame() {
      try {
        const { data: gameData, error: gameError } = await (supabaseClient
          .from("games").select("*").eq("slug", slug).single() as any);
        if (gameError) throw gameError;
        setGame((gameData ?? null) as Game);

        const { data: prodData, error: prodError } = await (supabaseClient
          .from("game_products").select("*").eq("game_id", gameData?.id).eq("status", "ACTIVE") as any);
        if (prodError) throw prodError;
        
        const prodList = (prodData ?? []) as GameProduct[];
        setProducts(prodList);
        if (prodList.length > 0) {
          setSelectedProduct(prodList[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGame();
  }, [slug]);

  const handleCheckout = () => {
    if (!selectedProduct) return;
    const inputLabel = selectedProduct.metadata?.input_label || "UID du joueur";
    if (!playerId.trim()) {
      alert(`Veuillez saisir votre ${inputLabel} avant de continuer.`);
      return;
    }
    router.push(`/checkout?product=${selectedProduct.id}&game=${game?.id}&uid=${encodeURIComponent(playerId)}&qty=${quantity}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-8">
          <div className="flex-1 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
          <div className="w-96 shrink-0">
            <Skeleton className="h-[450px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-950">Service ou Jeu non trouvé</h2>
          <p className="mt-2 text-surface-500">Ce service n'est pas disponible ou a été désactivé.</p>
          <Button variant="outline" className="mt-4 border-surface-200" onClick={() => router.push("/games")}>
            Retour au catalogue
          </Button>
        </div>
      </div>
    );
  }

  const meta = selectedProduct?.metadata || {};
  const currentPrice = selectedProduct ? Number(selectedProduct.price_gamer) * quantity : 0;
  const originalPrice = meta.price_original ? Number(meta.price_original) * quantity : currentPrice * 1.06;
  const savings = Math.max(0, originalPrice - currentPrice);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <PromoPopup />
      
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Title & Header */}
        <div className="flex items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-surface-200 shadow-xs">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-surface-200 overflow-hidden shadow-sm">
            {game.logo_url ? (
              <img src={game.logo_url} alt={game.name} className="h-full w-full object-contain p-1" />
            ) : (
              <ShoppingCart className="h-8 w-8 text-brand-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-surface-950">{game.name}</h1>
            <p className="text-sm text-surface-500 mt-0.5">Sélectionnez votre forfait et entrez vos identifiants pour recharger.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Main Section */}
          <div className="flex-1 space-y-6">
            
            {/* Region Selector Pills (GamsGo style) */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-surface-950 flex items-center gap-1.5">
                Sélectionner le montant <span className="text-red-500">•</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setSelectedRegion(region)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all border ${
                      selectedRegion === region
                        ? "bg-white border-red-500 text-red-600 ring-1 ring-red-500/30 shadow-xs font-bold"
                        : "bg-white border-surface-200 text-surface-600 hover:bg-surface-100"
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid (GamsGo Dark Cards) */}
            {products.length === 0 ? (
              <div className="rounded-2xl border border-surface-200 bg-white p-12 text-center">
                <p className="text-surface-500 font-medium">Aucun forfait disponible pour le moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const isSelected = selectedProduct?.id === product.id;
                  const pMeta = (product.metadata || {}) as Record<string, any>;
                  const pOriginal = pMeta.price_original ? Number(pMeta.price_original) : Number(product.price_gamer) * 1.06;
                  const discountLabel = String(pMeta.discount_badge || `-G${(pOriginal - Number(product.price_gamer)).toFixed(2)}`);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className={`relative flex flex-col justify-between text-left overflow-hidden rounded-2xl bg-zinc-950 p-4 transition-all duration-200 hover:scale-[1.02] cursor-pointer shadow-md ${
                        isSelected
                          ? "border-2 border-red-500 ring-2 ring-red-500/40 shadow-red-500/20"
                          : "border border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {/* Top-left Green Savings Pill */}
                      <div className="absolute top-2 left-2 z-10 bg-emerald-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                        {discountLabel}
                      </div>

                      {/* Product Image / Diamond Illustration */}
                      <div className="relative w-full h-32 flex items-center justify-center my-2 group">
                        {pMeta.image_url ? (
                          <img src={String(pMeta.image_url)} alt={product.name} className="h-28 w-28 object-contain drop-shadow-lg" />
                        ) : (
                          <div className="text-5xl drop-shadow-xl animate-pulse">💎</div>
                        )}

                        {/* Bottom Striped Caution Accent Bar */}
                        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-[repeating-linear-gradient(45deg,#eab308,#eab308_10px,#000_10px,#000_20px)] rounded-full opacity-80" />
                      </div>

                      {/* Product Title */}
                      <div className="mt-2 text-center">
                        <h4 className="text-sm font-bold text-white leading-tight line-clamp-2">
                          {product.name}
                        </h4>
                      </div>

                      {/* Price Section */}
                      <div className="mt-3 pt-2 border-t border-zinc-800 text-center">
                        <div className="text-lg font-black text-red-500 leading-none">
                          G{Number(product.price_gamer).toFixed(2)}
                        </div>
                        <div className="text-[11px] text-zinc-500 line-through mt-0.5 font-medium">
                          G{pOriginal.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Order Information Sidebar */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            
            {/* Main Order Card */}
            <div className="rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <h3 className="text-base font-extrabold text-surface-950 flex items-center gap-1.5">
                  Informations sur la commande <span className="text-red-500">•</span>
                </h3>
              </div>

              {/* UID / Account Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-surface-600">
                  {String(meta.input_label || "Veuillez saisir votre UID")} *
                </label>
                <input
                  type="text"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder={String(meta.input_label || "Veuillez saisir votre UID")}
                  className="w-full rounded-xl border border-surface-300 px-4 py-3 text-sm focus:border-red-500 focus:outline-hidden focus:ring-1 focus:ring-red-500 bg-slate-50 text-surface-950 font-medium"
                />
              </div>

              {/* Selected Product Summary Details */}
              {selectedProduct ? (
                <div className="space-y-4 pt-2">
                  <div className="text-lg font-black text-surface-950">
                    {selectedProduct.name}
                  </div>

                  <div className="space-y-2 text-xs font-medium text-surface-600">
                    <div className="flex items-center justify-between">
                      <span className="text-surface-500">Délai de livraison</span>
                      <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Clock className="h-3.5 w-3.5" /> {String(meta.delivery_time || "< 10 minute")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-surface-500">Méthode de recharge</span>
                      <span className="font-bold text-surface-950 underline decoration-dotted">
                        {String(meta.recharge_type || "Rechargement UID")}
                      </span>
                    </div>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-100">
                    <span className="text-xs font-semibold text-surface-600">Quantité</span>
                    <div className="flex items-center border border-surface-300 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="h-7 w-7 flex items-center justify-center bg-surface-100 text-surface-700 hover:bg-surface-200 font-bold"
                      >-</button>
                      <span className="w-10 text-center text-sm font-bold text-surface-950">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="h-7 w-7 flex items-center justify-center bg-surface-100 text-surface-700 hover:bg-surface-200 font-bold"
                      >+</button>
                    </div>
                  </div>

                  {/* Total & Savings */}
                  <div className="pt-4 border-t border-surface-100 flex items-end justify-between">
                    <span className="text-sm font-bold text-surface-700">Total :</span>
                    <div className="text-right">
                      {savings > 0 && (
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full mr-2">
                          Save G{savings.toFixed(2)}
                        </span>
                      )}
                      <span className="text-2xl font-black text-red-500">
                        G{currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Promo Coupon Dropdown Accordion */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPromoInput(!showPromoInput)}
                      className="w-full text-xs font-semibold text-surface-500 flex items-center justify-between hover:text-surface-800"
                    >
                      <span>Vous avez un code promo ou un coupon ?</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${showPromoInput ? "rotate-180" : ""}`} />
                    </button>

                    {showPromoInput && (
                      <div className="mt-2 flex gap-2 animate-slide-down">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Code PROMO"
                          className="flex-1 rounded-lg border border-surface-300 px-3 py-1.5 text-xs text-surface-950 uppercase"
                        />
                        <Button size="sm" className="bg-surface-900 text-white text-xs font-bold px-3">
                          Appliquer
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Red CTA Button */}
                  <Button
                    onClick={handleCheckout}
                    disabled={!playerId.trim()}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-black h-13 text-lg rounded-xl shadow-lg shadow-red-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Acheter maintenant
                  </Button>

                  {/* Guarantee Footer */}
                  <div className="pt-3 text-center flex items-center justify-center gap-1.5 text-xs text-surface-500 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Remboursement garanti</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}