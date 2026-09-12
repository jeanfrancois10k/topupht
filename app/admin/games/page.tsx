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
import { Gamepad2, Plus, X, Check } from "lucide-react";
import type { Game } from "@/types/shared";

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    publisher: "",
    category: "Mobile",
    logo_url: "",
    banner_url: "",
    display_order: 1,
    is_active: true,
  });

  async function fetchGames() {
    try {
      const { data, error } = await supabaseClient
        .from("games")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      setGames((data ?? []) as Game[]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchGames();
  }, []);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim() || !formData.slug.trim()) {
      setFormError("Le nom et le slug sont requis.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabaseClient.from("games").insert([
        {
          name: formData.name.trim(),
          slug: formData.slug.trim(),
          description: formData.description.trim() || null,
          publisher: formData.publisher.trim() || null,
          category: formData.category,
          logo_url: formData.logo_url.trim() || null,
          banner_url: formData.banner_url.trim() || null,
          display_order: Number(formData.display_order) || 1,
          is_active: formData.is_active,
        },
      ] as any);

      if (error) throw error;

      setShowAddModal(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        publisher: "",
        category: "Mobile",
        logo_url: "",
        banner_url: "",
        display_order: 1,
        is_active: true,
      });
      fetchGames();
    } catch (err: any) {
      setFormError(err.message || "Erreur lors de la création du jeu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleGameStatus = async (gameId: string, currentStatus: boolean) => {
    try {
      await (supabaseClient.from("games") as any)
        .update({ is_active: !currentStatus })
        .eq("id", gameId);
      fetchGames();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Spinner />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-50">Gestion des jeux</h1>
          <p className="mt-1 text-surface-400">{games.length} jeu(x) enregistré(s) dans le catalogue</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white font-bold gap-2 rounded-xl h-11 px-5"
        >
          <Plus className="h-5 w-5" />
          Ajouter un nouveau jeu
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-700 border border-surface-600 shrink-0 overflow-hidden">
                    {game.logo_url ? (
                      <img src={game.logo_url} alt={game.name} className="h-full w-full object-cover" />
                    ) : (
                      <Gamepad2 className="h-6 w-6 text-brand-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-surface-50">{game.name}</h3>
                    <p className="text-xs text-surface-400 font-mono">/{game.slug}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleGameStatus(game.id, game.is_active)}
                  className="cursor-pointer"
                >
                  <Badge variant={game.is_active ? "success" : "default"}>
                    {game.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </button>
              </div>

              {game.description && (
                <p className="mt-3 text-xs text-surface-400 line-clamp-2">{game.description}</p>
              )}

              <div className="mt-4 pt-3 border-t border-surface-700 flex items-center justify-between text-xs text-surface-400">
                <span>Catégorie: <strong className="text-surface-200">{(game as any).category || "General"}</strong></span>
                <span>Ordre: <strong className="text-surface-200">#{game.display_order}</strong></span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Ajouter un jeu */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-surface-700 bg-surface-800 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-surface-700 pb-4">
              <h3 className="text-xl font-bold text-surface-50 flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-brand-400" />
                Ajouter un jeu au catalogue
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Nom du jeu *</Label>
                  <Input
                    placeholder="ex: Call of Duty Mobile"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Slug (URL) *</Label>
                  <Input
                    placeholder="cod-mobile"
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    required
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50 font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <Label className="text-surface-300 text-xs font-semibold">Description</Label>
                <Input
                  placeholder="Service de recharge CP rapide"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Éditeur / Publisher</Label>
                  <Input
                    placeholder="ex: Activision / Garena"
                    value={formData.publisher}
                    onChange={(e) => setFormData((p) => ({ ...p, publisher: e.target.value }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
                <div>
                  <Label className="text-surface-300 text-xs font-semibold">Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData((p) => ({ ...p, display_order: Number(e.target.value) }))}
                    className="mt-1 bg-surface-900 border-surface-700 text-surface-50"
                  />
                </div>
              </div>

              <div>
                <Label className="text-surface-300 text-xs font-semibold">URL du Logo (Optionnel)</Label>
                <Input
                  placeholder="https://..."
                  value={formData.logo_url}
                  onChange={(e) => setFormData((p) => ({ ...p, logo_url: e.target.value }))}
                  className="mt-1 bg-surface-900 border-surface-700 text-surface-50 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-4 w-4 rounded border-surface-700 bg-surface-900 text-brand-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-surface-200 cursor-pointer">
                  Activer immédiatement le jeu sur la plateforme
                </label>
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
                  Enregistrer le jeu
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}