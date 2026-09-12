"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, XCircle, Clock, Wallet, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminDepositsPage() {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, []);

  async function fetchDeposits() {
    setIsLoading(true);
    const { data } = await supabaseClient
      .from("wallet_deposits")
      .select("*, profiles(full_name, email)")
      .order("created_at", { ascending: false });
    
    if (data) setDeposits(data);
    setIsLoading(false);
  }

  async function handleApprove(deposit: any) {
    if (!confirm(`Valider le dépôt de ${deposit.amount} ${deposit.currency} pour ${deposit.profiles?.full_name}?`)) return;
    
    setProcessingId(deposit.id);
    try {
      // 1. Get user's wallet
      const { data: wallet } = await supabaseClient.from("wallets").select("*").eq("user_id", deposit.user_id).single();
      if (!wallet) throw new Error("Portefeuille introuvable");

      const newBalance = parseFloat(wallet.balance) + parseFloat(deposit.amount);

      // 2. Update wallet
      await supabaseClient.from("wallets").update({ balance: String(newBalance) }).eq("id", wallet.id);

      // 3. Insert transaction
      await supabaseClient.from("wallet_transactions").insert({
        wallet_id: wallet.id,
        user_id: deposit.user_id,
        type: "DEPOSIT",
        amount: deposit.amount,
        currency: deposit.currency,
        status: "COMPLETED",
        reference_id: deposit.id,
        description: `Dépôt ${deposit.method} - Ref: ${deposit.reference}`,
      });

      // 4. Update deposit status
      await supabaseClient.from("wallet_deposits").update({
        status: "COMPLETED",
        processed_by: user?.id,
        processed_at: new Date().toISOString()
      }).eq("id", deposit.id);

      // Refresh
      await fetchDeposits();
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(deposit: any) {
    if (!confirm(`Rejeter ce dépôt ?`)) return;
    
    setProcessingId(deposit.id);
    try {
      await supabaseClient.from("wallet_deposits").update({
        status: "FAILED",
        notes: "Rejeté par l'administrateur",
        processed_by: user?.id,
        processed_at: new Date().toISOString()
      }).eq("id", deposit.id);

      await fetchDeposits();
    } catch (e: any) {
      alert("Erreur: " + e.message);
    } finally {
      setProcessingId(null);
    }
  }

  const filtered = deposits.filter(d => 
    !search || 
    d.reference?.toLowerCase().includes(search.toLowerCase()) || 
    d.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-surface-950 flex items-center gap-2">
            <Wallet className="h-8 w-8 text-htg-500" />
            Validation des Dépôts
          </h1>
          <p className="text-surface-500 mt-1">Gérez les recharges manuelles (MonCash/Natcash)</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input 
            placeholder="Rechercher (référence, nom)..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-white border-surface-200"
          />
        </div>
      </div>

      <Card className="border-surface-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-50 text-surface-500 font-semibold border-b border-surface-200 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Méthode & Réf</th>
                <th className="px-6 py-4 text-right">Montant</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Spinner className="h-8 w-8 text-htg-500 mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                    Aucun dépôt trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-surface-500">
                      {new Date(deposit.created_at).toLocaleDateString()} <br/>
                      <span className="text-xs">{new Date(deposit.created_at).toLocaleTimeString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-surface-900">{deposit.profiles?.full_name || 'Inconnu'}</p>
                      <p className="text-xs text-surface-500">{deposit.profiles?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-surface-100 border-surface-200 mb-1">{deposit.method}</Badge>
                      <p className="font-mono text-xs text-surface-600 font-bold">{deposit.reference}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-htg-600 text-base">
                      {formatCurrency(deposit.amount, deposit.currency)}
                    </td>
                    <td className="px-6 py-4">
                      {deposit.status === "PENDING" && <Badge className="bg-amber-100 text-amber-800 border-amber-200"><Clock className="w-3 h-3 mr-1" /> En attente</Badge>}
                      {deposit.status === "COMPLETED" && <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Validé</Badge>}
                      {deposit.status === "FAILED" && <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Rejeté</Badge>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {deposit.status === "PENDING" && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleReject(deposit)} 
                            disabled={processingId === deposit.id}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-none h-8 px-3"
                          >
                            Rejeter
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => handleApprove(deposit)}
                            disabled={processingId === deposit.id}
                            className="bg-green-500 hover:bg-green-600 text-white shadow-sm h-8 px-4"
                          >
                            {processingId === deposit.id ? <Spinner className="w-4 h-4" /> : "Valider"}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
