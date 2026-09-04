"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { PlusIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { GameProduct } from "@/types/shared";

export default function SellerProductsPage() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<GameProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabaseClient.from("game_products").select("*").eq("status", "ACTIVE");
        if (error) throw error;
        setProducts((data ?? []) as GameProduct[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Mes produits</h1>
          <p className="mt-1 text-surface-400">{products.length} produit(s) disponible(s)</p>
        </div>
        <Button>
          <Link href="/seller/products/new"><PlusIcon className="mr-2 h-4 w-4" />Ajouter</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-surface-700 card-hover">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <p className="text-xs text-surface-400">SKU: {product.sku}</p>
                </div>
                <Badge variant="success">Actif</Badge>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Prix gamer</span>
                  <span className="text-brand-400 font-bold">{formatCurrency(product.price_gamer, product.currency as any as any)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Prix vendeur</span>
                  <span className="text-htg-400 font-bold">{formatCurrency(product.price_seller ?? "0", product.currency as any as any)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Profit</span>
                  <span className="text-green-400 font-bold">
                    {formatCurrency((parseFloat(product.price_gamer) - parseFloat(product.price_seller ?? "0")).toString(), product.currency as any as any)}
                  </span>
                </div>
              </div>
              <Button variant="outline" className="mt-4 w-full">
                <Link href={`/seller/products/${product.id}`}>Voir détails <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}