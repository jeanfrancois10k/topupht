"use client";
// @ts-nocheck


import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Eye, EyeOff, Check, XCircle, ShoppingBag } from "lucide-react";

export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedCredentials, setRevealedCredentials] = useState<Record<string, boolean>>({});

  const fetchListings = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabaseClient
        .from("marketplace_listings")
        .select("*, profiles!marketplace_listings_seller_id_fkey(full_name, email), games(name)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const toggleReveal = (id: string) => {
    setRevealedCredentials(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await (supabaseClient
        .from("marketplace_listings") as any)
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      fetchListings();
    } catch (err) {
      alert("Erreur");
    }
  };

  const finalizeSale = async (listing: any) => {
    if (!confirm(`Es-tu sûr de vouloir transférer l'argent au vendeur pour cette annonce ?`)) return;
    
    try {
      // 1. Get seller's wallet
      const { data: walletData, error: walletError } = await (supabaseClient
        .from("wallets") as any)
        .select("*")
        .eq("user_id", listing.seller_id)
        .single();
        
      if (walletError || !walletData) throw new Error("Wallet introuvable");
      
      // 2. Add money
      const newBalance = parseFloat((walletData as any).balance) + parseFloat(listing.price);
      
      // 3. Update wallet
      await (supabaseClient.from("wallets") as any).update({ balance: newBalance.toString() }).eq("id", (walletData as any).id);
      
      // 4. Update listing status
      await updateStatus(listing.id, "SOLD");
      
      alert("Argent transféré avec succès au vendeur !");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  };

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-surface-950 flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-htg-500" />
          Escrow Marketplace
        </h1>
        <p className="mt-1 text-surface-500">Vérifiez les comptes soumis par les vendeurs et gérez les paiements sécurisés.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-htg-500" /></div>
      ) : listings.length === 0 ? (
        <Card className="border-surface-200 bg-surface-50">
          <CardContent className="py-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-surface-300" />
            <p className="mt-3 text-surface-500">Aucune annonce sur la marketplace.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <Card key={listing.id} className="border-surface-200 bg-white overflow-hidden shadow-sm">
              <div className="flex flex-col lg:flex-row">
                
                {/* Details */}
                <div className="flex-1 p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-surface-50">
                        {listing.games?.name} • {listing.type}
                      </Badge>
                      <h3 className="text-xl font-bold text-surface-950">{listing.title}</h3>
                      <p className="text-sm text-surface-500 mt-1">Vendeur : {listing.profiles?.full_name || listing.profiles?.email}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-htg-600">{formatCurrency(listing.price, listing.currency)}</div>
                      <Badge className={`mt-1 ${
                        listing.status === "PENDING_APPROVAL" ? "bg-yellow-100 text-yellow-700" :
                        listing.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        listing.status === "SOLD" ? "bg-blue-100 text-blue-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {listing.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-sm">
                    {listing.description || "Aucune description fournie."}
                  </div>
                  
                  {/* Credentials Section (Escrow) */}
                  <div className="border border-red-200 rounded-xl overflow-hidden">
                    <div className="bg-red-50 p-3 flex justify-between items-center border-b border-red-200">
                      <h4 className="font-bold text-red-800 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Identifiants Secrets (Escrow)
                      </h4>
                      <Button variant="ghost" size="sm" onClick={() => toggleReveal(listing.id)} className="text-red-700 hover:bg-red-100 h-8">
                        {revealedCredentials[listing.id] ? <><EyeOff className="h-4 w-4 mr-2" /> Cacher</> : <><Eye className="h-4 w-4 mr-2" /> Révéler</>}
                      </Button>
                    </div>
                    
                    {revealedCredentials[listing.id] ? (
                      <div className="p-4 bg-white grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-surface-400 uppercase">Login / Email</p>
                          <p className="font-mono font-bold text-surface-900">{listing.credentials?.username || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-surface-400 uppercase">Mot de passe</p>
                          <p className="font-mono font-bold text-surface-900">{listing.credentials?.password || "N/A"}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-white">
                        <p className="text-sm text-surface-500 italic text-center">Identifiants masqués pour sécurité.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:w-64 bg-surface-50 p-6 border-t lg:border-t-0 lg:border-l border-surface-200 flex flex-col justify-center space-y-3">
                  
                  {listing.status === "PENDING_APPROVAL" && (
                    <>
                      <Button onClick={() => updateStatus(listing.id, "ACTIVE")} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold">
                        <Check className="mr-2 h-4 w-4" /> Approuver (Publier)
                      </Button>
                      <Button variant="outline" onClick={() => updateStatus(listing.id, "REJECTED")} className="w-full text-red-600 hover:bg-red-50 border-red-200">
                        <XCircle className="mr-2 h-4 w-4" /> Rejeter
                      </Button>
                    </>
                  )}
                  
                  {listing.status === "ACTIVE" && (
                    <>
                      <Button onClick={() => finalizeSale(listing)} className="w-full bg-htg-500 hover:bg-htg-600 text-white font-bold">
                        <Check className="mr-2 h-4 w-4" /> Finaliser Vente (Payer Vendeur)
                      </Button>
                      <p className="text-xs text-center text-surface-500 mt-2">
                        Cliquez ici uniquement si un acheteur a payé et que vous lui avez donné les accès.
                      </p>
                    </>
                  )}

                  {listing.status === "SOLD" && (
                    <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-lg font-bold">
                      Vente terminée
                    </div>
                  )}

                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
