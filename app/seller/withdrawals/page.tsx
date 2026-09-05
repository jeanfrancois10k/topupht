"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { WalletIcon, Tag } from "lucide-react";
import type { Withdrawal } from "@/types/shared";

export default function SellerWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchWithdrawals() {
      try {
        const { data, error } = await supabaseClient.from("withdrawals").select("*").eq("seller_id", "placeholder").order("created_at", { ascending: false });
        if (error) throw error;
        setWithdrawals((data ?? []) as Withdrawal[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchWithdrawals();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabaseClient.from("withdrawals").insert({ seller_id: "placeholder", amount, currency: "HTG", method: "bank_transfer", status: "PENDING" } as any);
      if (!error && data) {
        setAmount("");
        setWithdrawals((prev) => [data[0] as Withdrawal, ...prev]);
      }
    } catch {
      // handle
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Retraits</h1>
        <p className="mt-1 text-surface-400">Demandez le retrait de vos fonds</p>
      </div>

      <Card className="border-surface-700 bg-surface-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-surface-50">
            <WalletIcon className="h-5 w-5 text-brand-400" />
            Nouvelle demande de retrait
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm text-surface-400">Montant (HTG)</label>
              <Input type="number" placeholder="1000" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" className="bg-surface-700" />
            </div>
            <Button type="submit" isLoading={isSubmitting} disabled={!amount || parseFloat(amount) <= 0}>
              Demander un retrait
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-surface-50">Historique des retraits</h2>
      </div>

      {withdrawals.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="py-12 text-center">
            <Tag className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucune demande de retrait pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className="border-surface-700 bg-surface-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-surface-50">{formatCurrency(withdrawal.amount, withdrawal.currency as any as any as any)}</p>
                      <Badge className={getStatusColor(withdrawal.status)}>{withdrawal.status}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-surface-400">{withdrawal.method}</p>
                    <p className="text-xs text-surface-500">{withdrawal.created_at}</p>
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