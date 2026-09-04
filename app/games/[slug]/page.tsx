// @ts-nocheck
"use client";
// @ts-nocheck
// @ts-nocheck

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeftIcon, ShoppingCart } from "lucide-react";
import Link from "next/link";
import type { Game, GameProduct } from "@/types/shared";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const [game, setGame] = useState<Game | null>(null);
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchGame();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Jeu non trouvé</h2>
          <p className="mt-2 text-surface-400">Ce jeu n'est pas disponible ou a été désactivé.</p>
          <Button variant="outline" className="mt-4">
            <Link href="/games">Retour aux jeux</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <Button variant="ghost">
        <Link href="/games"><ArrowLeftIcon className="mr-2 h-4 w-4" />Retour aux jeux</Link>
      </Button>

      <div className="rounded-xl border border-surface-700 bg-surface-800 p-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-xl bg-surface-700">
            {game.logo_url ? (
              <img src={game.logo_url} alt={game.name} className="h-full w-full object-contain" />
            ) : (
              <ShoppingCart className="h-16 w-16 text-surface-500" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{game.name}</h1>
            {game.description && <p className="mt-2 text-surface-300">{game.description}</p>}
            <Badge variant="success" className="mt-3">Actif</Badge>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Produits disponibles</h2>
        {products.length === 0 ? (
          <div className="rounded-xl border border-surface-700 bg-surface-800 p-8 text-center">
            <p className="text-surface-400">Aucun produit disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden border-surface-700 card-hover">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                      <p className="text-xs text-surface-400">SKU: {product.sku}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-400">{formatCurrency(product.price_gamer, product.currency as any)}</span>
                    <Link href={`/checkout?product=${product.id}&game=${game.id}`}>
                      <Button size="sm">Acheter</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}