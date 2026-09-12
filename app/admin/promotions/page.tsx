"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Gift, Plus, RefreshCw } from "lucide-react";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchPromotions() {
    try {
      setIsLoading(true);
      const { data, error } = await (supabaseClient
        .from("promotions")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) throw error;
      setPromotions((data ?? []) as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPromotions();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-6">
        <Spinner />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 rounded-2xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-50 flex items-center gap-3">
            <Gift className="h-8 w-8 text-yellow-400" />
            Gestion des Promotions & Codes Promo
          </h1>
          <p className="mt-1 text-surface-400">{promotions.length} promotion(s) configurée(s)</p>
        </div>
        <Button
          onClick={fetchPromotions}
          variant="outline"
          className="border-surface-700 text-surface-300 hover:bg-surface-800 gap-2 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {promotions.length === 0 ? (
        <div className="rounded-2xl border border-surface-700 bg-surface-800 p-12 text-center">
          <Gift className="mx-auto h-12 w-12 text-surface-600 mb-3" />
          <h3 className="text-lg font-bold text-surface-50">Aucune promotion active</h3>
          <p className="text-sm text-surface-400 mt-1">Créez des codes promo pour vos joueurs et vendeurs.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((item) => (
            <Card key={item.id} className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-surface-50">{item.name}</h3>
                    {item.code && <Badge variant="warning" className="mt-1 font-mono">{item.code}</Badge>}
                  </div>
                  <Badge variant={item.is_active ? "success" : "default"}>
                    {item.is_active ? "Actif" : "Inactif"}
                  </Badge>
                </div>

                <div className="text-xs text-surface-400">
                  <p>Type: <span className="text-surface-200 font-semibold">{item.type}</span></p>
                  <p>Valeur: <span className="text-yellow-400 font-bold">{item.value}%</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
