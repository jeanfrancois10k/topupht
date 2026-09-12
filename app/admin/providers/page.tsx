"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Cpu, RefreshCw, Zap } from "lucide-react";

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchProviders() {
    try {
      setIsLoading(true);
      const { data, error } = await (supabaseClient
        .from("providers")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) throw error;
      setProviders((data ?? []) as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchProviders();
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
            <Cpu className="h-8 w-8 text-brand-400" />
            Fournisseurs API (Automatisations)
          </h1>
          <p className="mt-1 text-surface-400">Gestion des intégrations API fournisseurs (Smile One, UniPin, Mock)</p>
        </div>
        <Button
          onClick={fetchProviders}
          variant="outline"
          className="border-surface-700 text-surface-300 hover:bg-surface-800 gap-2 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-600/20 text-brand-400 rounded-xl flex items-center justify-center font-bold">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-surface-50">Mock Provider</h3>
                  <p className="text-xs text-surface-400 font-mono">CODE: MOCK</p>
                </div>
              </div>
              <Badge variant="success">Actif (Test)</Badge>
            </div>
            <p className="text-xs text-surface-400">Fournisseur de test simulé pour la validation instantanée des livraisons de diamants.</p>
          </CardContent>
        </Card>

        {providers.map((item) => (
          <Card key={item.id} className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-surface-50">{item.name}</h3>
                  <p className="text-xs text-surface-400 font-mono">{item.code}</p>
                </div>
                <Badge variant={item.is_active ? "success" : "default"}>
                  {item.is_active ? "Actif" : "Inactif"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
