"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Activity } from "lucide-react";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import type { Commission } from "@/types/shared";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabaseClient.from("commissions").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setCommissions((data ?? []) as Commission[]);
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Commissions</h1>
        <p className="mt-1 text-surface-400">{commissions.length} commission(s) — Total: {formatCurrency(commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0))}</p>
      </div>

      {commissions.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Activity className="h-12 w-12 text-surface-500" />
            <p className="mt-4 text-lg text-surface-400">Aucune commission trouvée</p>
            <p className="mt-1 text-sm text-surface-500">Les commissions apparaîtront ici une fois générée.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {commissions.map((commission) => (
            <Card key={commission.id} className="overflow-hidden border-surface-700 card-hover">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(commission.status)}>{commission.status}</Badge>
                  <span className="text-xs text-surface-400">{commission.type}</span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-surface-400">Vendeur</span>
                    <span className="text-sm text-surface-50">{commission.seller_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-surface-400">Commande</span>
                    <span className="text-sm text-surface-50">{commission.order_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-surface-400">Montant</span>
                    <span className="text-sm text-surface-50 font-bold">{formatCurrency(commission.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-surface-400">Taux</span>
                    <span className="text-sm text-surface-50">{commission.rate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}