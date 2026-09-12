"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Package, Plus, X, Check, Tag, Clock, Globe, Image as ImageIcon } from "lucide-react";
import type { Game, GameProduct } from "@/types/shared";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    game_id: "",
    name: "",
    sku: "",
    price_gamer: "",
    price_original: "",
    price_seller: "",
    cost_provider: "",
    discount_badge: "",
    image_url: "",
    region: "Global",
    delivery_time: "< 10 min",
    input_label: "UID du joueur",
    status: "ACTIVE",
  });

  async function fetchData() {
    try {
      const [productsRes, gamesRes] = await Promise.all([
        supabaseClient.from("game_products").select("*").order("created_at", { ascending: false }),
        supabaseClient.from("games").select("id, name, category").order("name", { ascending: true }),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (gamesRes.error) throw gamesRes.error;

      setProducts((productsRes.data ?? []) as GameProduct[]);
      const gamesList = (gamesRes.data ?? []) as Game[];
      setGames(gamesList);

      if (gamesList.length > 0 && !formData.game_id) {
        setFormData((prev) => ({ ...prev, game_id: gamesList[0].id }));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleNameChange = (name: string) => {
    const sku = name
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, name, sku }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.game_id || !formData.name.trim() || !formData.price_gamer) {
      setFormError("Veuillez sélectionner un jeu/service, saisir un nom et un prix gamer.");
      return;
    }

    setIsSubmitting(true);
    try {
      const metadata = {
        price_original: formData.price_original.trim() || null,
        discount_badge: formData.discount_badge.trim() || null,
        image_url: formData.image_url.trim() || null,
        region: formData.region.trim() || "Global",
        delivery_time: formData.delivery_time.trim() || "< 10 min",
        input_label: formData.input_label.trim() || "UID du joueur",
      };

      const { error } = await (supabaseClient.from("game_products") as any).insert([
        {
          game_id: formData.game_id,
          name: formData.name.trim(),
          sku: formData.sku.trim() || `SKU-${Date.now()}`,
          price_gamer: formData.price_gamer,
          price_seller: formData.price_seller || formData.price_gamer,
          cost_provider: formData.cost_provider || "0",
          status: formData.status,
          metadata: metadata,
        },
      ]);

      if (error) throw error;

      setShowAddModal(false);
      setFormData((prev) => ({
        ...prev,
        name: "",
        sku: "",
        price_gamer: "",
        price_original: "",
        price_seller: "",
        cost_provider: "",
        discount_badge: "",
        image_url: "",
        region: "Global",
        delivery_time: "< 10 min",
        input_label: "UID du joueur",
        status: "ACTIVE",
      }));
      fetchData();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de l'ajout du produit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Spinner />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getGameName = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    return game ? game.name : "Jeu/Service inconnu";
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-50">Gestion des Produits & Abonnements</h1>
          <p className="mt-1 text-surface-400">{products.length} forfait(s) de recharge / abonnements IA configurés</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold gap-2 rounded-xl h-11 px-5 shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Créer un produit / forfait
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const meta = (product.metadata || {}) as Record<string, any>;
          return (
            <Card key={product.id} className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {meta.image_url ? (
                      <img src={String(meta.image_url)} alt="" className="h-10 w-10 object-contain rounded-lg bg-surface-900 p-1 border border-surface-700" />
                    ) : (
                      <div className="h-10 w-10 bg-brand-500/20 text-brand-400 rounded-lg flex items-center justify-center font-bold">
                        💎
                      </div>
                    )}
                    <div>
                      <Badge className="bg-surface-700 text-surface-300 text-[10px] mb-1">
                        {getGameName(product.game_id)}
                      </Badge>
                      <h3 className="text-base font-bold text-surface-50">{product.name}</h3>
                      <p className="text-xs text-surface-400 font-mono">{product.sku}</p>
                    </div>
                  </div>
                  <Badge variant={product.status === "ACTIVE" ? "success" : "default"}>
                    {product.status}
                  </Badge>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-700 space-y-1.5 text-sm">
                  <div className="flex justify-between items-center text-surface-400">
                    <span>Prix Joueur :</span>
                    <div className="text-right">
                      <span className="text-red-400 font-black text-base">{product.price_gamer} HTG</span>
                      {meta.price_original && (
                        <span className="text-xs text-surface-400 line-through block">{String(meta.price_original)} HTG</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-surface-400 text-xs">
                    <span>Prix Vendeur :</span>
                    <span className="text-htg-400 font-bold">{product.price_seller} HTG</span>
                  </div>
                  <div className="flex justify-between items-center text-surface-400 text-xs">
                    <span>Badge Réduction :</span>
                    <span className="text-green-400 font-semibold">{String(meta.discount_badge || "Aucun")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Ajouter un Produit Style GamsGo / Topup */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-2xl border border-surface-700 bg-surface-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-700 pb-4">
              <h3 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                <Package className="h-5 w-5 text-brand-400" />
                Créer un produit / Forfait (Jeux ou Abonnements IA)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-surface-400 hover:bg-surface-700 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 text-sm text-red-400 bg-red-950/50 border border-red-800/50 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-surface-300 text-xs font-semibold">Jeu ou Service Associé *</Label>
                <select
                  value={formData.game_id}
                  onChange={(e) => setFormData((p) => ({ ...p, game_id: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-surface-700 bg-surface-900 px-3 py-2.5 text-sm text-surface-50 focus:border-brand-500 focus:outline-hidden"
                  required
                >
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({(g as any).category || "Jeu"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Nom du Produit / Forfait *</Label>
                  <Input
                    placeholder="ex: 100 Diamants ou ChatGPT Plus 1 Mois"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">SKU / Code Produit</Label>
                  <Input
                    placeholder="ex: FF-100-DIA ou CHATGPT-PLUS-1M"
                    value={formData.sku}
                    onChange={(e) => setFormData((p) => ({ ...p, sku: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Prix Vente (HTG) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="153.01"
                    value={formData.price_gamer}
                    onChange={(e) => setFormData((p) => ({ ...p, price_gamer: e.target.value }))}
                    required
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 font-bold text-red-400"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Prix Barré d'origine</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="162.16"
                    value={formData.price_original}
                    onChange={(e) => setFormData((p) => ({ ...p, price_original: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Prix Vendeur (HTG)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="140.00"
                    value={formData.price_seller}
                    onChange={(e) => setFormData((p) => ({ ...p, price_seller: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Coût API (HTG)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="110.00"
                    value={formData.cost_provider}
                    onChange={(e) => setFormData((p) => ({ ...p, cost_provider: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Badge Réduction (ex: -G9.15 ou -10%)</Label>
                  <Input
                    placeholder="-G9.15"
                    value={formData.discount_badge}
                    onChange={(e) => setFormData((p) => ({ ...p, discount_badge: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Délai de livraison estimé</Label>
                  <Input
                    placeholder="< 10 min ou Instant"
                    value={formData.delivery_time}
                    onChange={(e) => setFormData((p) => ({ ...p, delivery_time: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">URL de l'image du produit (Optionnel)</Label>
                  <Input
                    placeholder="https://... (ex: coffre de diamant ou logo IA)"
                    value={formData.image_url}
                    onChange={(e) => setFormData((p) => ({ ...p, image_url: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Libellé du champ requis à l'achat</Label>
                  <Input
                    placeholder="ex: UID du joueur ou Email du compte"
                    value={formData.input_label}
                    onChange={(e) => setFormData((p) => ({ ...p, input_label: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-surface-700 text-surface-300 hover:bg-surface-700"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  {isSubmitting ? <Spinner /> : <Check className="h-4 w-4 mr-2" />}
                  Enregistrer le produit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}