"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/types/shared";

export default function OrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!profile?.id) return;
      try {
        const { data, error } = await supabaseClient.from("orders").select("*").eq("user_id", profile.id).order("created_at", { ascending: false });
        if (error) throw error;
        setOrders((data ?? []) as Order[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [profile?.id]);

  if (isLoading) {
    return (
      <div className="space-y-8 p-4">
        <Spinner className="h-8 w-48" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Spinner key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-surface-50">Mes commandes</h1>
        <p className="mt-1 text-surface-400">{orders.length} commande(s) trouvée(s)</p>
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
                    <p className="text-sm font-semibold text-surface-50">{order.order_number}</p>
                    <p className="text-xs text-surface-400">{order.product_id}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={order.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : order.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}>{order.status}</Badge>
                    <p className="mt-1 text-sm font-bold text-surface-50">{formatCurrency(order.amount, order.currency as any as any)}</p>
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