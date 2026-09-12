"use client";
// @ts-nocheck

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, ArrowLeft, Gamepad2, Gem, KeyRound } from "lucide-react";
import Link from "next/link";
import type { Game } from "@/types/shared";

export default function SellMarketplacePage() {
  const router = useRouter();
  const { profile, isAuthenticated } = useAuth();
  
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [listingType, setListingType] = useState<"ACCOUNT" | "CURRENCY" | "ITEM">("CURRENCY");
  const [gameId, setGameId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(""); // Player UID or Code/Password

  useEffect(() => {
    async function fetchGames() {
      const { data } = await supabaseClient.from("games").select("*").eq("is_active", true);
      if (data) setGames(data as Game[]);
    }
    fetchGames();
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="mt-4 text-2xl font-bold text-surface-950">Connexion requise</h2>
            <p className="mt-2 text-surface-500">Veuillez vous connecter pour vendre sur la marketplace.</p>
            <Button className="mt-6 w-full bg-htg-500 hover:bg-htg-600 font-bold" onClick={() => router.push('/auth/login')}>
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !title || !price) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const credentials = { deliveryInfo };

      const { error: insertError } = await (supabaseClient.from("marketplace_listings") as any).insert({
        seller_id: profile?.id,
        game_id: gameId,
        type: listingType,
        title,
        description,
        price,
        credentials,
        status: "PENDING_APPROVAL"
      });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la création de l'annonce");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <Card className="border-green-200 bg-white shadow-xl overflow-hidden text-center">
          <div className="bg-green-500 h-2 w-full"></div>
          <CardContent className="p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-black text-surface-950 mb-2">Annonce soumise avec succès !</h2>
            <p className="text-surface-600 mb-6">
              Votre offre est en cours de vérification par un administrateur. Elle sera publiée sur la marketplace dès approbation. Vous recevrez le paiement sur votre Solde (Wallet) moins la commission de la plateforme dès la vente !
            </p>
            <Link href="/marketplace">
              <Button className="bg-surface-950 text-white hover:bg-surface-800 font-bold px-8">
                Retour à la Marketplace
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="text-surface-500 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>

      <div>
        <h1 className="text-3xl font-black text-surface-950">Déposer une offre de Vente</h1>
        <p className="mt-1 text-surface-500">Proposez vos Diamants, Comptes ou Codes de jeux et touchez l'argent directement sur votre Solde.</p>
      </div>

      {/* Select Type Pills */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { type: "CURRENCY", label: "💎 Diamants / Monnaie", desc: "Vendre des diamants ou recharges UID" },
          { type: "ACCOUNT", label: "🎮 Compte de Jeu", desc: "Vendre un compte Free Fire, MLBB, etc." },
          { type: "ITEM", label: "🎁 Code / Pass", desc: "Vendre des cartes cadeaux ou pass" },
        ].map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => setListingType(item.type as any)}
            className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
              listingType === item.type
                ? "border-red-500 bg-red-50/30 ring-2 ring-red-500/20"
                : "border-surface-200 bg-white hover:border-surface-300"
            }`}
          >
            <div className="font-bold text-sm text-surface-950">{item.label}</div>
            <div className="text-[11px] text-surface-500 mt-1">{item.desc}</div>
          </button>
        ))}
      </div>

      <Card className="bg-white border-surface-200 shadow-sm">
        <CardContent className="p-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start mb-8">
            <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-bold mb-1">Système de Vente Sécurisé (Escrow & Commission)</p>
              <ul className="list-disc pl-4 space-y-1 text-xs">
                <li>L'acheteur règle la commande via la plateforme. TOPUP+ bloque l'argent en sécurité.</li>
                <li>Après livraison et validation, l'argent est crédité sur votre **Solde (Wallet)** moins la commission plateforme.</li>
                <li>Vous pouvez demander le retrait de votre solde vers votre **MonCash** à tout moment !</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="game" className="font-bold">Jeu ou Service *</Label>
                <select 
                  id="game" 
                  value={gameId} 
                  onChange={(e) => setGameId(e.target.value)}
                  className="w-full rounded-lg border border-surface-300 p-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                  required
                >
                  <option value="">Sélectionnez un jeu / service...</option>
                  {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price" className="font-bold">Prix de vente souhaité (HTG) *</Label>
                <Input 
                  id="price" 
                  type="number"
                  placeholder="Ex: 500 HTG" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="font-bold">Titre de l'annonce *</Label>
              <Input 
                id="title" 
                placeholder={
                  listingType === "CURRENCY"
                    ? "Ex: 520 Diamants Free Fire - Recharge Instantanée UID"
                    : listingType === "ACCOUNT"
                    ? "Ex: Compte Free Fire Lvl 65 avec Skins Rares"
                    : "Ex: Pass de combat / Code cadeau"
                }
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="font-bold">Description de l'offre</Label>
              <textarea 
                id="description" 
                rows={3}
                placeholder="Détails du lot, conditions de livraison, etc..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-surface-300 p-3 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryInfo" className="font-bold">
                {listingType === "CURRENCY"
                  ? "Instruction de recharge / Contact vendeur"
                  : listingType === "ACCOUNT"
                  ? "Identifiants du compte (Email & Mot de passe - Privé)"
                  : "Code / Clé produit (Privé)"}
              </Label>
              <Input 
                id="deliveryInfo" 
                placeholder="Ex: Je suis disponible de 8h à 22h pour recharger l'UID / Identifiants"
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
              />
              <p className="text-[11px] text-surface-500">Les informations privées ne sont partagées avec l'acheteur qu'une fois le paiement bloqué par la plateforme.</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-red-500 hover:bg-red-600 text-white font-black h-12 text-lg rounded-xl shadow-md cursor-pointer" 
              disabled={isLoading}
            >
              {isLoading ? <Spinner className="mr-2" /> : "Publier l'offre de vente"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
