// @ts-nocheck
import { supabaseClient } from "@/config/supabase";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, ArrowRight } from "lucide-react";

async function getActiveGames() {
  try {
    const { data, error } = await supabaseClient.from("games").select("*").eq("status", "ACTIVE").order("display_order", { ascending: true }).limit(8);
    if (error) throw error;
    return data;
  } catch {
    return [];
  }
}

export async function PopularGames() {
  const games = await getActiveGames();

  return (
    <section className="border-t border-surface-800 bg-surface-950 py-16">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-white">Jeux populaires</h2>
          <Link href="/games" className="hidden items-center gap-1 text-sm font-medium text-brand-400 hover:underline md:flex">
            Voir tous <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {games.length === 0 ? (
          <div className="rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucun jeu disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {games.map((game) => (
              <Link key={game.id} href={`/games/${game.slug}`} className="group">
                <Card className="overflow-hidden border-surface-700 transition-all hover:border-brand-500/50">
                  <div className="aspect-video bg-surface-700 flex items-center justify-center overflow-hidden">
                    {game.logo_url ? (
                      <img src={game.logo_url ?? ""} alt={game.name} className="h-full w-full object-contain p-4" />
                    ) : (
                      <Gamepad2 className="h-12 w-12 text-surface-500 group-hover:text-brand-400 transition-colors" />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-400 transition-colors">{game.name}</h3>
                    <Badge variant="success" className="mt-2">Actif</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}