"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Gamepad2, Search } from "lucide-react";
import type { Game } from "@/types/shared";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabaseClient.from("games").select("*").eq("status", "ACTIVE").order("display_order", { ascending: true });
        if (error) throw error;
        setGames((data ?? []) as Game[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchGames();
  }, []);

  const filtered = games.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()) || g.slug.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Tous les jeux</h1>
        <p className="mt-1 text-surface-400">Choisissez votre jeu pour commencer</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input type="text" placeholder="Rechercher un jeu..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-surface-600 bg-surface-800 py-2.5 pl-10 pr-4 text-sm text-surface-100 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
          <Gamepad2 className="mx-auto h-12 w-12 text-surface-600" />
          <p className="mt-3 text-surface-400">Aucun jeu trouvé.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((game) => (
            <Link key={game.id} href={`/games/${game.slug}`}>
              <Card className="overflow-hidden border-surface-700 transition-all hover:border-brand-500/50 hover:shadow-lg">
                <div className="aspect-video bg-surface-700 flex items-center justify-center">
                  {game.logo_url ? (
                    <img src={game.logo_url} alt={game.name} className="h-full w-full object-contain p-4" />
                  ) : (
                    <Gamepad2 className="h-12 w-12 text-surface-500" />
                  )}
                </div>
                <CardContent className="p-4">
                  <CardTitle className="text-white">{game.name}</CardTitle>
                  {game.description && <p className="mt-1 line-clamp-2 text-xs text-surface-400">{game.description}</p>}
                  <Badge variant="success" className="mt-2">Actif</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}