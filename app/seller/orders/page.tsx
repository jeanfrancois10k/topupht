"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { ShoppingBag } from "lucide-react";
import type { Order } from "@/types/shared";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { data, error } = await supabaseClient.from("orders").select("*").eq("user_id", "placeholder").order("created_at", { ascending: false });
        if (error) throw error;
        setOrders((data ?? []) as Order[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

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
        <h1 className="text-3xl font-bold text-white">Mes commandes</h1>
        <p className="mt-1 text-surface-400">Historique des commandes du vendeur</p>
      </div>

      {orders.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucune commande pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border-surface-700 bg-surface-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{order.order_number}</p>
                    <p className="text-xs text-surface-400">{order.product_id}</p>
                    <p className="text-xs text-surface-500">{order.created_at}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    <p className="mt-1 text-sm font-bold text-white">{formatCurrency(order.amount, order.currency as any as any)}</p>
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