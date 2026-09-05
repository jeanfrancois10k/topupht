"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import type { Order } from "@/types/shared";

export default function OrderDetailPage() {
  const params = useParams();
  const orderNumber = Array.isArray(params.id) ? params.id[0] : params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data, error } = await supabaseClient.from("orders").select("*").eq("order_number", orderNumber).single();
        if (error) throw error;
        setOrder((data ?? null) as Order);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-surface-700 bg-surface-800 text-center">
          <CardContent className="p-8">
            <ShoppingBag className="mx-auto h-12 w-12 text-surface-600" />
            <h2 className="mt-4 text-xl font-bold text-surface-50">Commande non trouvée</h2>
            <p className="mt-2 text-surface-400">Cette commande n'existe pas ou a été supprimée.</p>
            <Link href="/orders" className="mt-4 inline-block">
              <Button variant="outline">Retour aux commandes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-surface-50">Commande {order.order_number}</h1>
          <p className="mt-1 text-surface-400">Créée le {new Date(order.created_at).toLocaleDateString("fr-HT")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-surface-700 bg-surface-800">
          <CardHeader>
            <CardTitle>Détails de la commande</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-surface-400">Statut</span>
              <Badge className={order.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : order.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}>
                {order.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">Montant</span>
              <span className="text-lg font-bold text-brand-400">{formatCurrency(order.amount, order.currency as any as any)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">Jeu</span>
              <span className="text-surface-50">{order.product_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">Joueur</span>
              <span className="text-surface-50">{order.player_id ?? "Non renseigné"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">Serveur</span>
              <span className="text-surface-50">{order.server_id ?? "Non spécifié"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400">IDempotency</span>
              <span className="text-xs text-surface-500">{order.idempotency_key ?? "N/A"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-surface-700 bg-surface-800">
          <CardHeader>
            <CardTitle>Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {order.payment ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-surface-400">Méthode</span>
                  <span className="text-surface-50">{order.payment.provider_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Statut</span>
                  <Badge className={order.payment.status === "SUCCESS" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}>
                    {order.payment.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Transaction</span>
                  <span className="text-xs text-surface-500">{order.payment.transaction_id ?? "N/A"}</span>
                </div>
              </div>
            ) : (
              <p className="text-surface-400">Aucun paiement enregistré.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}