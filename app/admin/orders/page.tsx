"use client";
// @ts-nocheck


import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingBag, Copy, Check, XCircle, Search, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient
        .from("orders")
        .select("*, profiles!orders_user_id_fkey(full_name, email), game_products(name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setOrders((data ?? []));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await (supabaseClient
        .from("orders") as any)
        .update({ status: newStatus })
        .eq("id", orderId);
      
      if (error) throw error;
      fetchOrders();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  };

  const handleFulfillOrder = async (orderId: string) => {
    try {
      setIsLoading(true);
      // 1. Mark payment as received first
      await (supabaseClient.from("orders") as any).update({ status: "PROCESSING" }).eq("id", orderId);
      
      // 2. Call Fulfillment API
      const res = await fetch('/api/orders/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur de livraison");
      
      alert("Livraison automatique réussie !");
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      fetchOrders(); // Will refresh and show SUCCESS or FAILED
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredOrders = orders.filter(o => {
    if (filter === "PENDING") return o.status === "PAYMENT_PENDING";
    if (filter === "PROCESSING") return o.status === "PROCESSING";
    return true;
  });

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-surface-950">Gestion des Commandes</h1>
          <p className="mt-1 text-surface-500">Gérez les paiements manuels et les livraisons</p>
        </div>
        
        <div className="flex gap-2 bg-surface-100 p-1 rounded-lg border border-surface-200">
          <button 
            onClick={() => setFilter("ALL")} 
            className={`px-4 py-2 text-sm font-bold rounded-md ${filter === "ALL" ? "bg-white text-surface-950 shadow-sm" : "text-surface-500"}`}
          >
            Toutes
          </button>
          <button 
            onClick={() => setFilter("PENDING")} 
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 ${filter === "PENDING" ? "bg-red-50 text-red-600 shadow-sm" : "text-surface-500"}`}
          >
            Paiements en attente
          </button>
          <button 
            onClick={() => setFilter("PROCESSING")} 
            className={`px-4 py-2 text-sm font-bold rounded-md flex items-center gap-2 ${filter === "PROCESSING" ? "bg-blue-50 text-blue-600 shadow-sm" : "text-surface-500"}`}
          >
            À Livrer
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-htg-500" /></div>
      ) : filteredOrders.length === 0 ? (
        <Card className="border-surface-200 bg-surface-50">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-surface-300" />
            <p className="mt-3 text-surface-500">Aucune commande trouvée.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-surface-200 bg-white hover:border-htg-300 transition-all shadow-sm">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  
                  {/* Info Section */}
                  <div className="flex-1 p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-surface-500">#{order.order_number}</span>
                          <span className="text-xs text-surface-400">{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                        <h3 className="text-lg font-bold text-surface-950">{order.game_products?.name || "Produit inconnu"}</h3>
                        <p className="text-sm text-surface-500">Client: {order.profiles?.full_name || order.profiles?.email || order.user_id}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-htg-600">{formatCurrency(order.amount, order.currency)}</div>
                        <Badge variant="outline" className={`mt-1 font-bold ${
                          order.payment_method === 'MANUAL_MONCASH' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-htg-600 border-htg-200'
                        }`}>
                          {order.payment_method === 'MANUAL_MONCASH' ? 'MonCash Manuel' : 'Solde Wallet'}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-surface-100">
                      <div>
                        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-1">UID Joueur (À Recharger)</p>
                        <div className="flex items-center gap-2">
                          <code className="bg-surface-100 px-2 py-1 rounded text-surface-900 font-mono font-bold">{order.player_id}</code>
                          <button onClick={() => copyToClipboard(order.player_id)} className="p-1 text-surface-400 hover:text-htg-500">
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {order.payment_method === 'MANUAL_MONCASH' && order.notes && (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Ref. MonCash du client</p>
                          <p className="font-mono font-bold text-red-600 text-lg">{order.notes.replace('Reference MonCash: ', '')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div className="lg:w-72 bg-surface-50 p-6 border-t lg:border-t-0 lg:border-l border-surface-200 flex flex-col justify-center">
                    <div className="mb-4 text-center">
                      <p className="text-xs font-bold text-surface-400 uppercase mb-2">Statut Actuel</p>
                      <Badge className={`text-sm px-3 py-1 ${
                        order.status === "SUCCESS" ? "bg-green-100 text-green-700" : 
                        order.status === "PROCESSING" ? "bg-blue-100 text-blue-700" : 
                        order.status === "FAILED" ? "bg-surface-200 text-surface-600" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {order.status === "PAYMENT_PENDING" ? "En attente de paiement" : order.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mt-auto">
                      {order.status === "PAYMENT_PENDING" && order.payment_method === "MANUAL_MONCASH" && (
                        <>
                          <Button 
                            onClick={() => handleFulfillOrder(order.id)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold"
                          >
                            <Check className="mr-2 h-4 w-4" /> Valider & Livrer
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleUpdateStatus(order.id, "FAILED")}
                            className="w-full text-red-600 hover:bg-red-50 border-red-200"
                          >
                            <XCircle className="mr-2 h-4 w-4" /> Fausse Référence
                          </Button>
                        </>
                      )}

                      {order.status === "PROCESSING" && (
                        <Button 
                          onClick={() => handleUpdateStatus(order.id, "SUCCESS")}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold"
                        >
                          <Check className="mr-2 h-4 w-4" /> Marquer comme Livré
                        </Button>
                      )}
                    </div>
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