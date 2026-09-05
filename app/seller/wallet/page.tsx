"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { WalletIcon, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { Wallet, WalletTransaction } from "@/types/shared";

export default function SellerWalletPage() {
  const [wallet, setWallet] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const walletRes = await supabaseClient.from("wallets").select("*").eq("user_id", "placeholder").single();
        const txRes = await supabaseClient.from("wallet_transactions").select("*").eq("user_id", "placeholder").order("created_at", { ascending: false }).limit(10);
        setWallet((walletRes.data ?? null) as Wallet | null);
        setTransactions((txRes.data ?? []) as WalletTransaction[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((_, i) => (
            <div key={i} className="h-32 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Mon portefeuille</h1>
        <p className="mt-1 text-surface-400">Gérez votre solde professionnel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-600/20">
                <WalletIcon className="h-7 w-7 text-brand-400" />
              </div>
              <div>
                <p className="text-sm text-surface-400">Solde disponible</p>
                <p className="mt-1 text-3xl font-bold text-surface-50">{wallet ? formatCurrency(wallet.balance, wallet.currency as any as any as any) : "0 HTG"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-surface-50 mb-4">Transactions récentes</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between rounded-lg bg-surface-700 p-3">
                  <div className="flex items-center gap-2">
                    {tx.type === "DEPOSIT" || tx.type === "BONUS" ? <ArrowUpCircle className="h-4 w-4 text-green-400" /> : <ArrowDownCircle className="h-4 w-4 text-red-400" />}
                    <span className="text-sm text-surface-300">{tx.type}</span>
                  </div>
                  <span className={`text-sm font-bold ${tx.type === "DEPOSIT" || tx.type === "BONUS" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "DEPOSIT" || tx.type === "BONUS" ? "+" : "-"}{formatCurrency(tx.amount, tx.currency as any as any as any)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-sm text-surface-400">Aucune transaction</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}