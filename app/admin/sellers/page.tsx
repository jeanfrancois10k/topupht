"use client";

// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Store, Users } from "lucide-react";
import type { SellerProfile, SellerRequest } from "@/types/shared";

export default function AdminSellersPage() {
  const [profiles, setProfiles] = useState<SellerProfile[]>([]);
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: profilesData, error: profilesError } = await supabaseClient.from("seller_profiles").select("*").order("created_at", { ascending: false });
        if (profilesError) throw profilesError;
        setProfiles((profilesData ?? []) as SellerProfile[]);

        const { data: requestsData, error: requestsError } = await supabaseClient.from("seller_requests").select("*").order("created_at", { ascending: false });
        if (requestsError) throw requestsError;
        setRequests((requestsData ?? []) as SellerRequest[]);
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-surface-700 bg-surface-800 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestion des Vendeurs</h1>
        <p className="mt-1 text-surface-400">{profiles.length} vendeur(s) approuvé(s) — {requests.length} demande(s) en attente</p>
      </div>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-5 w-5 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Vendeurs approuvés</h2>
          <Badge className="bg-purple-500/20 text-purple-400">{profiles.length}</Badge>
        </div>

        {profiles.length === 0 ? (
          <Card className="border-surface-700 bg-surface-800">
            <CardContent className="py-12 text-center">
              <Store className="mx-auto h-12 w-12 text-surface-600" />
              <p className="mt-3 text-surface-400">Aucun vendeur approuvé pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile) => (
              <Card key={profile.id} className="border-surface-700 bg-surface-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-700">
                        <Store className="h-5 w-5 text-surface-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{profile.business_name ?? profile.user_id}</p>
                        <p className="text-xs text-surface-400">{profile.user_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(profile.status)}>{profile.status}</Badge>
                      <p className="text-xs text-surface-400">{new Date(profile.created_at).toLocaleDateString("fr-HT")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">Demandes en attente</h2>
          <Badge className="bg-yellow-500/20 text-yellow-400">{requests.length}</Badge>
        </div>

        {requests.length === 0 ? (
          <Card className="border-surface-700 bg-surface-800">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-surface-600" />
              <p className="mt-3 text-surface-400">Aucune demande en attente pour le moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-surface-700 bg-surface-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-700">
                        <Users className="h-5 w-5 text-surface-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{request.full_name}</p>
                        <p className="text-xs text-surface-400">{request.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      <p className="text-xs text-surface-400">{new Date(request.created_at).toLocaleDateString("fr-HT")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}