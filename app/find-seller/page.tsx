"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Avatar } from "@/components/ui/avatar";
import { Search, MapPin, Phone, MessageCircle } from "lucide-react";
import type { SellerProfile } from "@/types/shared";

export default function FindMerchantPage() {
  const [merchants, setMerchants] = useState<SellerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchMerchants() {
      try {
        const { data, error } = await supabaseClient.from("seller_profiles").select("*").eq("status", "APPROVED").order("created_at", { ascending: false });
        if (error) throw error;
        setMerchants((data ?? []) as SellerProfile[]);
      } catch {
        // handle
      } finally {
        setIsLoading(false);
      }
    }
    fetchMerchants();
  }, []);

  const filtered = merchants.filter((m) => 
    (m.business_name ?? "").toLowerCase().includes(search.toLowerCase()) || 
    (m.city ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (m.zone ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div className="text-center bg-gradient-to-br from-surface-50 to-surface-100 rounded-3xl p-8 border border-surface-200 shadow-sm">
        <MapPin className="mx-auto h-12 w-12 text-htg-500 mb-4" />
        <h1 className="text-4xl font-extrabold text-surface-950">Trouver un Marchand Officiel</h1>
        <p className="mt-4 text-surface-600 max-w-2xl mx-auto text-lg">
          Rechargez votre Solde TOPUP+ en payant en espèces auprès de l'un de nos marchands agréés. Cherchez un point de vente près de chez vous !
        </p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
        <input 
          type="text" 
          placeholder="Rechercher par nom, ville ou zone..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full rounded-full border-2 border-surface-200 bg-white py-4 pl-12 pr-4 text-surface-900 placeholder-surface-400 shadow-sm focus:border-htg-500 focus:outline-none focus:ring-1 focus:ring-htg-500 transition-all text-lg" 
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-htg-500" /></div>
      ) : filtered.length === 0 ? (
        <Card className="border-surface-200 bg-surface-50 shadow-sm">
          <CardContent className="py-16 text-center">
            <MapPin className="mx-auto h-16 w-16 text-surface-300 mb-4" />
            <h3 className="text-xl font-bold text-surface-900">Aucun marchand trouvé</h3>
            <p className="mt-2 text-surface-500">Essayez de modifier vos critères de recherche.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((merchant) => (
            <Card key={merchant.id} className="overflow-hidden border-surface-200 bg-white hover:border-htg-300 hover:shadow-md transition-all group">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Avatar 
                      alt={merchant.business_name ?? merchant.user_id} 
                      fallback={merchant.business_name?.substring(0,2).toUpperCase() ?? "MR"} 
                      className="h-16 w-16 border-2 border-surface-100 shadow-sm"
                    />
                    <Badge variant="success" className="bg-green-100 text-green-700 border-green-200">
                      Marchand Vérifié
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-extrabold text-surface-950 mb-1 line-clamp-1">
                    {merchant.business_name ?? "Marchand Indépendant"}
                  </h3>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-surface-600">
                      <MapPin className="h-4 w-4 mr-2 text-surface-400" />
                      <span className="line-clamp-1">{merchant.zone ? `${merchant.zone}, ${merchant.city}` : (merchant.city ?? "Zone non renseignée")}</span>
                    </div>
                    {merchant.phone && (
                      <div className="flex items-center text-sm font-medium text-surface-900">
                        <Phone className="h-4 w-4 mr-2 text-htg-500" />
                        {merchant.phone}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-surface-50 border-t border-surface-100 p-4 flex gap-2">
                  <a href={`tel:${merchant.phone}`} className="flex-1">
                    <button className="w-full py-2 bg-white border border-surface-200 rounded-lg text-sm font-bold text-surface-700 hover:bg-surface-100 transition-colors flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2" /> Appeler
                    </button>
                  </a>
                  <a href={`https://wa.me/${merchant.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <button className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                    </button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}