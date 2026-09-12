"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ShoppingBag, ShieldCheck, Gamepad2, Info } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchListings() {
      try {
        const { data, error } = await supabaseClient
          .from("marketplace_listings")
          .select("*, games(name, logo_url)")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        setListings(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchListings();
  }, []);

  return (
    <div className="space-y-8 p-4 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-surface-950 overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-surface-900 to-transparent z-10"></div>
        {/* Placeholder background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-htg-500 via-surface-950 to-surface-950"></div>
        
        <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Marketplace <span className="text-htg-500">Sécurisée</span>
            </h1>
            <p className="mt-4 text-surface-300 text-lg">
              Achetez et vendez des comptes de jeux ou des devises directement avec d'autres joueurs. Toutes les transactions sont vérifiées et sécurisées par TOPUP+.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/marketplace/sell">
                <Button className="bg-htg-500 hover:bg-htg-600 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-htg-500/20">
                  Vendre un compte
                </Button>
              </Link>
              <div className="flex items-center text-surface-400 text-sm font-medium">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-400" /> 100% Garanti
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex shrink-0">
            <div className="h-48 w-48 rounded-full bg-gradient-to-br from-htg-400/20 to-htg-600/20 flex items-center justify-center border-4 border-surface-800 shadow-2xl">
              <Gamepad2 className="h-24 w-24 text-htg-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800 font-medium">
          L'Admin sécurise toutes les ventes. Lors d'un achat, votre argent est bloqué. L'Admin récupère les identifiants du vendeur, les vérifie, vous les transfère, puis paie le vendeur. Zéro risque d'arnaque !
        </p>
      </div>

      {/* Listings */}
      <div>
        <h2 className="text-2xl font-bold text-surface-950 mb-6">Dernières Annonces</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="h-8 w-8 text-htg-500" /></div>
        ) : listings.length === 0 ? (
          <Card className="border-surface-200 bg-surface-50 shadow-sm">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="mx-auto h-16 w-16 text-surface-300 mb-4" />
              <h3 className="text-xl font-bold text-surface-900">Aucune annonce pour le moment</h3>
              <p className="mt-2 text-surface-500 mb-6">Soyez le premier à vendre un compte sur la plateforme !</p>
              <Link href="/marketplace/sell">
                <Button variant="outline" className="border-htg-500 text-htg-600 hover:bg-htg-50 font-bold rounded-full">
                  Créer une annonce
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden border-surface-200 bg-white hover:border-htg-300 hover:shadow-lg transition-all group flex flex-col">
                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-5 flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-surface-100 rounded-lg p-1 border border-surface-200">
                          {listing.games?.logo_url ? (
                            <img src={listing.games.logo_url} alt="" className="h-full w-full object-contain" />
                          ) : (
                            <Gamepad2 className="h-full w-full text-surface-400" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">{listing.games?.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-surface-50 text-surface-700">
                        {listing.type === 'ACCOUNT' ? 'Compte' : listing.type === 'CURRENCY' ? 'Devises' : 'Objet'}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-surface-950 mb-2 line-clamp-2">
                      {listing.title}
                    </h3>
                    
                    <p className="text-sm text-surface-500 line-clamp-2 mb-4">
                      {listing.description}
                    </p>
                  </div>
                  
                  <div className="bg-surface-50 border-t border-surface-100 p-4 flex items-center justify-between mt-auto">
                    <div>
                      <p className="text-xs text-surface-400 font-medium">Prix Sécurisé</p>
                      <p className="text-xl font-black text-htg-600">{formatCurrency(listing.price, listing.currency)}</p>
                    </div>
                    
                    {isAuthenticated ? (
                      <Link href={`/marketplace/${listing.id}`}>
                        <Button size="sm" className="bg-surface-950 hover:bg-surface-800 text-white font-bold rounded-lg shadow-sm">
                          Acheter
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/login">
                        <Button size="sm" variant="outline" className="font-bold rounded-lg">
                          Connexion
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
