"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Gamepad2, ChevronRight, Star, Trophy, Sword, Shield, CheckCircle2,
  ArrowLeft, Plus, Trash2, Lock, Info
} from "lucide-react";
import Link from "next/link";

export default function SubmitGameAccountPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [games, setGames] = useState<any[]>([]);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    game_id: "",
    title: "",
    description: "",
    type: "SALE" as "SALE" | "RENTAL",
    rank: "",
    level: "",
    server: "",
    skins_count: "",
    heroes_count: "",
    highlights: [""],
    price: "",
    rental_price_per_day: "",
    min_rental_days: "1",
    currency: "HTG",
    // Credentials (private)
    account_username: "",
    account_password: "",
    account_email: "",
    credential_notes: "",
  });

  useEffect(() => {
    fetchGames();
  }, []);

  async function fetchGames() {
    const { data } = await supabaseClient
      .from("games")
      .select("id, name, logo_url")
      .eq("is_active", true)
      .order("display_order");
    if (data) setGames(data);
  }

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function addHighlight() {
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }));
  }

  function updateHighlight(index: number, value: string) {
    const updated = [...form.highlights];
    updated[index] = value;
    setForm((prev) => ({ ...prev, highlights: updated }));
  }

  function removeHighlight(index: number) {
    setForm((prev) => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  }

  async function handleSubmit() {
    if (!isAuthenticated || !user) {
      router.push("/auth/login");
      return;
    }

    if (!form.game_id || !form.title || !form.price) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    if (!form.account_username || !form.account_password) {
      setError("Les identifiants du compte sont obligatoires.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const highlights = form.highlights.filter((h) => h.trim());
      const credentials = {
        username: form.account_username,
        password: form.account_password,
        email: form.account_email,
        notes: form.credential_notes,
      };

      const { error: insertError } = await supabaseClient
        .from("game_accounts")
        .insert({
          seller_id: user.id,
          game_id: form.game_id,
          title: form.title,
          description: form.description,
          type: form.type,
          rank: form.rank || null,
          level: form.level ? parseInt(form.level) : null,
          server: form.server || null,
          skins_count: form.skins_count ? parseInt(form.skins_count) : 0,
          heroes_count: form.heroes_count ? parseInt(form.heroes_count) : 0,
          highlights: highlights.length > 0 ? highlights : null,
          price: form.price,
          rental_price_per_day: form.type === "RENTAL" ? form.rental_price_per_day : null,
          min_rental_days: form.type === "RENTAL" ? parseInt(form.min_rental_days) : null,
          currency: form.currency,
          credentials: credentials,
          status: "PENDING_REVIEW",
        });

      if (insertError) throw insertError;
      setSuccess(true);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la soumission.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto p-4 py-12 text-center space-y-5">
        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-2xl font-black text-surface-950">Compte soumis !</h1>
        <p className="text-surface-500">
          Votre compte a été soumis pour vérification. L'admin le validera dans les <strong>24h</strong>. Une fois approuvé, il apparaîtra sur la marketplace.
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left space-y-1 text-sm text-blue-800">
          <p>✅ Compte reçu par l'admin</p>
          <p>🔍 Vérification en cours (24h max)</p>
          <p>🚀 Publication sur le Marketplace</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/marketplace/accounts">
            <Button className="bg-htg-500 hover:bg-htg-600 text-white font-bold rounded-full">
              Voir le Marketplace
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full">Mon Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Link href="/marketplace/accounts" className="inline-flex items-center gap-2 text-surface-500 hover:text-surface-900 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div>
        <h1 className="text-3xl font-black text-surface-950">Vendre ou louer un compte</h1>
        <p className="text-surface-500 mt-1">Votre compte sera vérifié avant publication. Vos identifiants sont cryptés.</p>
      </div>

      {/* Security notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Vos identifiants sont <strong>chiffrés</strong> et accessibles uniquement par l'admin lors d'une vente. Ils ne sont jamais partagés publiquement.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 items-center">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
              step >= s ? "bg-htg-500 text-white" : "bg-surface-100 text-surface-400"
            }`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-8 transition-all ${step > s ? "bg-htg-500" : "bg-surface-200"}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-surface-500 font-medium">
          {step === 1 ? "Infos du compte" : step === 2 ? "Prix & Type" : "Identifiants privés"}
        </span>
      </div>

      {/* STEP 1 — Account Info */}
      {step === 1 && (
        <Card className="border-surface-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-htg-500" />
              Informations du compte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Game selection */}
            <div>
              <Label className="font-semibold">Jeu *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {games.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => updateForm("game_id", game.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.game_id === game.id
                        ? "border-htg-500 bg-htg-50 text-htg-700"
                        : "border-surface-200 hover:border-htg-300 text-surface-600"
                    }`}
                  >
                    {game.logo_url ? (
                      <img src={game.logo_url} alt="" className="h-5 w-5 object-contain" />
                    ) : (
                      <Gamepad2 className="h-4 w-4" />
                    )}
                    {game.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="font-semibold">Titre de l'annonce *</Label>
              <Input
                placeholder="Ex: Compte Free Fire Diamond 5 — 120 skins rares"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="mt-1.5 h-11"
              />
            </div>

            <div>
              <Label className="font-semibold">Description</Label>
              <Textarea
                placeholder="Décrivez les points forts de votre compte..."
                value={form.description}
                onChange={(e) => updateForm("description", e.target.value)}
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="font-semibold flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-500" /> Rang</Label>
                <Input placeholder="Ex: Diamond 5, Mythic" value={form.rank} onChange={(e) => updateForm("rank", e.target.value)} className="mt-1.5 h-10" />
              </div>
              <div>
                <Label className="font-semibold">Niveau</Label>
                <Input type="number" placeholder="Ex: 85" value={form.level} onChange={(e) => updateForm("level", e.target.value)} className="mt-1.5 h-10" />
              </div>
              <div>
                <Label className="font-semibold flex items-center gap-1"><Star className="h-4 w-4 text-purple-500" /> Nombre de skins</Label>
                <Input type="number" placeholder="Ex: 45" value={form.skins_count} onChange={(e) => updateForm("skins_count", e.target.value)} className="mt-1.5 h-10" />
              </div>
              <div>
                <Label className="font-semibold flex items-center gap-1"><Sword className="h-4 w-4 text-blue-500" /> Héros / Persos</Label>
                <Input type="number" placeholder="Ex: 30" value={form.heroes_count} onChange={(e) => updateForm("heroes_count", e.target.value)} className="mt-1.5 h-10" />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <Label className="font-semibold">Points forts</Label>
              <p className="text-xs text-surface-400 mb-2">Listez ce qui rend ce compte unique</p>
              <div className="space-y-2">
                {form.highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder={`Ex: Skin légendaire rare, Rang Mythic...`}
                      value={h}
                      onChange={(e) => updateHighlight(i, e.target.value)}
                      className="h-9"
                    />
                    {form.highlights.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => removeHighlight(i)} className="h-9 w-9 p-0 text-red-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addHighlight} className="text-xs gap-1">
                  <Plus className="h-3 w-3" /> Ajouter
                </Button>
              </div>
            </div>

            <Button onClick={() => setStep(2)} className="w-full bg-htg-500 hover:bg-htg-600 text-white font-bold h-11 rounded-xl">
              Continuer →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* STEP 2 — Price & Type */}
      {step === 2 && (
        <Card className="border-surface-200 shadow-sm">
          <CardHeader>
            <CardTitle>Prix & Type de vente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Sale vs Rental */}
            <div>
              <Label className="font-semibold">Type de transaction *</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  onClick={() => updateForm("type", "SALE")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.type === "SALE" ? "border-htg-500 bg-htg-50" : "border-surface-200 hover:border-htg-300"
                  }`}
                >
                  <p className="font-bold text-surface-900">💰 Vente</p>
                  <p className="text-xs text-surface-500 mt-0.5">Transfert définitif du compte</p>
                </button>
                <button
                  onClick={() => updateForm("type", "RENTAL")}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.type === "RENTAL" ? "border-htg-500 bg-htg-50" : "border-surface-200 hover:border-htg-300"
                  }`}
                >
                  <p className="font-bold text-surface-900">⏱️ Location</p>
                  <p className="text-xs text-surface-500 mt-0.5">Accès temporaire au compte</p>
                </button>
              </div>
            </div>

            {form.type === "SALE" ? (
              <div>
                <Label className="font-semibold">Prix de vente (HTG) *</Label>
                <div className="relative mt-1.5">
                  <Input
                    type="number"
                    placeholder="Ex: 15000"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    className="pr-14 h-12 text-lg font-bold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold text-sm">HTG</span>
                </div>
                <p className="text-xs text-surface-400 mt-1">Commission plateforme: 10% • Vous recevrez: {form.price ? `${(parseFloat(form.price) * 0.9).toLocaleString()} HTG` : "—"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="font-semibold">Prix par jour (HTG) *</Label>
                  <div className="relative mt-1.5">
                    <Input
                      type="number"
                      placeholder="Ex: 500"
                      value={form.rental_price_per_day}
                      onChange={(e) => { updateForm("rental_price_per_day", e.target.value); updateForm("price", e.target.value); }}
                      className="pr-14 h-12 text-lg font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 font-bold text-sm">HTG/j</span>
                  </div>
                </div>
                <div>
                  <Label className="font-semibold">Durée minimum (jours)</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={form.min_rental_days}
                    onChange={(e) => updateForm("min_rental_days", e.target.value)}
                    className="mt-1.5 h-10"
                    min="1"
                  />
                </div>
              </div>
            )}

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Retour</Button>
              <Button
                onClick={() => {
                  if (!form.price) { setError("Le prix est obligatoire."); return; }
                  setError(null);
                  setStep(3);
                }}
                className="flex-1 bg-htg-500 hover:bg-htg-600 text-white font-bold"
              >
                Continuer →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 3 — Private credentials */}
      {step === 3 && (
        <Card className="border-surface-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              Identifiants privés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                Ces informations sont <strong>chiffrées</strong> et visibles uniquement par l'admin lors de la livraison à l'acheteur. Elles ne sont jamais affichées publiquement.
              </p>
            </div>

            <div>
              <Label className="font-semibold">Nom d'utilisateur / ID du compte *</Label>
              <Input
                placeholder="Ex: player123 ou ID: 4567890"
                value={form.account_username}
                onChange={(e) => updateForm("account_username", e.target.value)}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label className="font-semibold">Mot de passe *</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={form.account_password}
                onChange={(e) => updateForm("account_password", e.target.value)}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label className="font-semibold">Email associé (optionnel)</Label>
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={form.account_email}
                onChange={(e) => updateForm("account_email", e.target.value)}
                className="mt-1.5 h-10"
              />
            </div>
            <div>
              <Label className="font-semibold">Notes supplémentaires</Label>
              <Textarea
                placeholder="Ex: Compte lié à Facebook, numéro de téléphone de récupération..."
                value={form.credential_notes}
                onChange={(e) => updateForm("credential_notes", e.target.value)}
                className="mt-1.5"
              />
            </div>

            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Retour</Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-htg-500 hover:bg-htg-600 text-white font-bold"
              >
                {isLoading ? <Spinner className="h-4 w-4" /> : "Soumettre mon compte"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
