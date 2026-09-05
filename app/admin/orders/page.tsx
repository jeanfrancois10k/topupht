"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Order } from "@/types/shared";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabaseClient.from("orders").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setOrders((data ?? []) as Order[]);
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
          <div key={i} className="h-20 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Toutes les commandes</h1>
        <p className="mt-1 text-surface-400">{orders.length} commande(s)</p>
      </div>

      <Card className="border-surface-700 bg-surface-800 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-700">
                  <th className="px-4 py-3 text-left text-surface-400">Commande</th>
                  <th className="px-4 py-3 text-left text-surface-400">Client</th>
                  <th className="px-4 py-3 text-left text-surface-400">Produit</th>
                  <th className="px-4 py-3 text-left text-surface-400">Montant</th>
                  <th className="px-4 py-3 text-left text-surface-400">Statut</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-surface-700/50 hover:bg-surface-700/30">
                    <td className="px-4 py-3 text-surface-50 font-medium">{order.order_number}</td>
                    <td className="px-4 py-3 text-surface-300">{order.user_id}</td>
                    <td className="px-4 py-3 text-surface-300">{order.product_id}</td>
                    <td className="px-4 py-3 text-surface-50">{formatCurrency(order.amount, order.currency as any as any)}</td>
                    <td className="px-4 py-3">
                      <Badge className={order.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : order.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}