// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import type { Wallet, WalletTransaction } from "@/types/shared";
import { Wallet } from "lucide-react";

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: walletsData, error: walletsError } = await supabaseClient
          .from("wallets")
          .select("*")
          .order("balance", { ascending: false });
        if (walletsError) throw walletsError;
        setWallets((walletsData ?? []) as Wallet[]);

        const { data: txData, error: txError } = await supabaseClient
          .from("wallet_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        if (txError) throw txError;
        setTransactions((txData ?? []) as WalletTransaction[]);
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const totalBalance = wallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
  const filteredWallets = wallets.filter((w) =>
    w.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Portefeuilles</h1>
        <p className="mt-1 text-surface-400">{wallets.length} portefeuille(s) — Solde total : {formatCurrency(totalBalance)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Total HTG</p>
                <p className="mt-1 text-2xl font-bold text-yellow-400">{formatCurrency(totalBalance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Portefeuilles</p>
                <p className="mt-1 text-2xl font-bold text-brand-400">{wallets.length}</p>
              </div>
              <Wallet className="h-8 w-8 text-brand-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">Actifs</p>
                <p className="mt-1 text-2xl font-bold text-green-400">{wallets.filter((w) => w.status === "ACTIVE").length}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-surface-400">FROZEN / LOCKED</p>
                <p className="mt-1 text-2xl font-bold text-red-400">{wallets.filter((w) => w.status !== "ACTIVE").length}</p>
              </div>
              <Wallet className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-surface-700 bg-surface-800">
        <CardHeader>
          <CardTitle>Tous les Portefeuilles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Rechercher par utilisateur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {filteredWallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Wallet className="mb-4 h-12 w-12 text-surface-500" />
              <p className="text-surface-400">Aucun portefeuille trouvé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWallets.map((wallet) => (
                <Card key={wallet.id} className="border-surface-700 bg-surface-800/50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-700">
                        <Wallet className="h-5 w-5 text-brand-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{wallet.user_id}</p>
                        <p className="text-xs text-surface-400">{wallet.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-white">{formatCurrency(wallet.balance, wallet.currency as any)}</span>
                      <Badge className={getStatusColor(wallet.status)}>{wallet.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-surface-700 bg-surface-800">
        <CardHeader>
          <CardTitle>Transactions Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-surface-400">Aucune transaction récente</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="px-4 py-3 text-left text-surface-400">Transaction</th>
                    <th className="px-4 py-3 text-left text-surface-400">Utilisateur</th>
                    <th className="px-4 py-3 text-left text-surface-400">Type</th>
                    <th className="px-4 py-3 text-left text-surface-400">Montant</th>
                    <th className="px-4 py-3 text-left text-surface-400">Statut</th>
                    <th className="px-4 py-3 text-left text-surface-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-surface-700/50 hover:bg-surface-700/30">
                      <td className="px-4 py-3 text-white font-medium">{tx.id.slice(0, 8)}</td>
                      <td className="px-4 py-3 text-surface-300">{tx.user_id}</td>
                      <td className="px-4 py-3 text-surface-300">{tx.type}</td>
                      <td className="px-4 py-3 text-white">{formatCurrency(tx.amount, tx.currency as any)}</td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(tx.status)}>{tx.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-surface-400">{new Date(tx.created_at).toLocaleDateString("ht-HT")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}