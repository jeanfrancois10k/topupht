"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Package } from "lucide-react";
import type { GameProduct } from "@/types/shared";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabaseClient.from("game_products").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setProducts((data ?? []) as GameProduct[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetch();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des produits</h1>
        <p className="mt-1 text-surface-400">{products.length} produit(s)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-surface-700 card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">{product.name}</h3>
                  <p className="text-xs text-surface-400">{product.sku}</p>
                </div>
                <Badge variant={product.status === "ACTIVE" ? "success" : "default"}>{product.status}</Badge>
              </div>
              <div className="mt-4 space-y-1">
                <p className="text-sm text-surface-400">Prix gamer: <span className="text-brand-400 font-bold">{product.price_gamer} HTG</span></p>
                <p className="text-sm text-surface-400">Prix vendeur: <span className="text-htg-400 font-bold">{product.price_seller} HTG</span></p>
                <p className="text-sm text-surface-400">Coût: <span className="text-surface-300 font-bold">{product.cost_provider} HTG</span></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}