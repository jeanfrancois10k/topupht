"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Search, MapPin } from "lucide-react";
import type { SellerProfile } from "@/types/shared";

export default function FindSellerPage() {
  const [sellers, setSellers] = useState<SellerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchSellers() {
      try {
        const { data, error } = await supabaseClient.from("seller_profiles").select("*").eq("status", "APPROVED").order("created_at", { ascending: false });
        if (error) throw error;
        setSellers((data ?? []) as SellerProfile[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchSellers();
  }, []);

  const filtered = sellers.filter((s) => (s.business_name ?? "").toLowerCase().includes(search.toLowerCase()) || (s.city ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Trouver un vendeur</h1>
        <p className="mt-2 text-surface-400">Trouvez un vendeur de confiance près de chez vous</p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
        <input type="text" placeholder="Rechercher par nom ou ville..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-surface-600 bg-surface-800 py-2.5 pl-10 pr-4 text-sm text-surface-100 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
      </div>

      {isLoading ? (
        <div className="flex justify-center"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardContent className="py-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-surface-600" />
            <p className="mt-3 text-surface-400">Aucun vendeur trouvé.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((seller) => (
            <Card key={seller.id} className="overflow-hidden border-surface-700 bg-surface-800 card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar alt={seller.business_name ?? seller.user_id} fallback={seller.business_name ?? seller.user_id} />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{seller.business_name ?? "Vendeur"}</h3>
                    <p className="text-xs text-surface-400">{seller.city ?? "Zone non renseignée"}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="success" className="text-xs">Vérifié</Badge>
                  <Badge variant="default" className="text-xs">{seller.level}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}