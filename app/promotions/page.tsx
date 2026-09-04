"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Gift } from "lucide-react";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [promoRes, couponRes] = await Promise.all([
          supabaseClient.from("promotions").select("*").eq("is_active", true).order("created_at", { ascending: false }),
          supabaseClient.from("coupons").select("*").eq("is_used", false).limit(10),
        ]);
        setPromotions((promoRes.data ?? []) as any[]);
        setCoupons((couponRes.data ?? []) as any[]);
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Promotions et Coupons</h1>
        <p className="mt-1 text-surface-400">Découvrez nos offres actives</p>
      </div>

      {promotions.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="py-12 text-center">
            <Gift className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucune promotion disponible pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => (
              <Card key={promo.id} className="border-surface-700 bg-surface-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-yellow-400" />
                    {promo.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Badge variant="warning">{promo.type}</Badge>
                    <span className="text-lg font-bold text-white">{formatCurrency(promo.value)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-surface-400">
                    <span>Du {new Date(promo.start_date).toLocaleDateString("fr-HT")}</span>
                    <span>au {new Date(promo.end_date).toLocaleDateString("fr-HT")}</span>
                  </div>
                  {promo.code && <Badge variant="info" className="mt-2">{promo.code}</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>

          {coupons.length > 0 && (
            <Card className="border-surface-700 bg-surface-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-green-400" />
                  Coupons disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {coupons.map((coupon) => (
                    <div key={coupon.id} className="flex items-center justify-between rounded-lg bg-surface-700 p-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{coupon.code}</p>
                        <p className="text-xs text-surface-400">Réf : {coupon.promotion_id}</p>
                      </div>
                      <Badge variant="success" className={getStatusColor("ACTIVE")}>Disponible</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}