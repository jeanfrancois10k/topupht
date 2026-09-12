"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { Tag, Check, X, RefreshCw } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchWithdrawals() {
    try {
      setIsLoading(true);
      const { data, error } = await (supabaseClient
        .from("withdrawals")
        .select("*")
        .order("created_at", { ascending: false }) as any);

      if (error) throw error;
      setWithdrawals((data ?? []) as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await (supabaseClient.from("withdrawals") as any)
        .update({ status })
        .eq("id", id);
      fetchWithdrawals();
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
            <Tag className="h-8 w-8 text-htg-400" />
            Gestion des Demandes de Retrait (Vendeurs)
          </h1>
          <p className="mt-1 text-surface-400">{withdrawals.length} demande(s) de retrait enregistrée(s)</p>
        </div>
        <Button
          onClick={fetchWithdrawals}
          variant="outline"
          className="border-surface-700 text-surface-300 hover:bg-surface-800 gap-2 rounded-xl"
        >
          <RefreshCw className="h-4 w-4" />
          Actualiser
        </Button>
      </div>

      {withdrawals.length === 0 ? (
        <div className="rounded-2xl border border-surface-700 bg-surface-800 p-12 text-center">
          <Tag className="mx-auto h-12 w-12 text-surface-600 mb-3" />
          <h3 className="text-lg font-bold text-surface-50">Aucune demande de retrait</h3>
          <p className="text-sm text-surface-400 mt-1">Les demandes de retrait effectuées par les vendeurs apparaîtront ici.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {withdrawals.map((item) => (
            <Card key={item.id} className="overflow-hidden border border-surface-700 bg-surface-800 card-hover">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-surface-50">
                      {formatCurrency(item.amount)}
                    </h3>
                    <p className="text-xs text-surface-400 font-mono">Méthode: {item.payment_method || "MonCash"}</p>
                  </div>
                  <Badge variant={item.status === "APPROVED" || item.status === "COMPLETED" ? "success" : item.status === "REJECTED" ? "danger" : "warning"}>
                    {item.status}
                  </Badge>
                </div>

                <div className="text-xs text-surface-400 space-y-1">
                  <p>Vendeur ID: <span className="font-mono text-surface-200">{item.seller_id}</span></p>
                  {item.account_details && <p>Détails: <span className="text-surface-200">{item.account_details}</span></p>}
                </div>

                {item.status === "PENDING" && (
                  <div className="flex gap-2 pt-2 border-t border-surface-700">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(item.id, "COMPLETED")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <Check className="h-4 w-4 mr-1" /> Approuver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(item.id, "REJECTED")}
                      className="border-red-900/40 text-red-400 hover:bg-red-950/50 font-bold text-xs"
                    >
                      <X className="h-4 w-4 mr-1" /> Rejeter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
