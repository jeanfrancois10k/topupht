"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Gamepad2 } from "lucide-react";
import type { Game } from "@/types/shared";

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabaseClient.from("games").select("*").order("display_order", { ascending: true });
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

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
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
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Gestion des jeux</h1>
        <p className="mt-1 text-surface-400">{games.length} jeu(x) dans la base</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => (
          <Card key={game.id} className="overflow-hidden border-surface-700 card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-700">
                    <Gamepad2 className="h-5 w-5 text-brand-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-50">{game.name}</h3>
                    <p className="text-xs text-surface-400">{game.slug}</p>
                  </div>
                </div>
                <Badge variant={game.is_active ? "success" : "default"}>{game.is_active ? "Actif" : "Inactif"}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}