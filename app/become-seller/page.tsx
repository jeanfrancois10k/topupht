"use client";
// @ts-nocheck

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { Spinner } from "@/components/ui/spinner";
import { Store, Check, Clock, Shield, Users } from "lucide-react";
import type { SellerProfile } from "@/types/shared";

export default function BecomeSellerPage() {
  const { profile, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const { data, error } = await supabaseClient.from("seller_requests").insert({
        user_id: profile?.id,
        full_name: profile?.full_name ?? "",
        phone: formData.get("phone") ?? "",
        city: formData.get("city") ?? "",
        zone: formData.get("zone") ?? "",
        experience_months: parseInt(formData.get("experience") as string) || null,
        reason: formData.get("reason") ?? "",
        status: "PENDING",
      } as any);

      if (error) throw error;
      setSubmitted(true);
    } catch {
      // handle
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md border-surface-700 bg-surface-800 text-center">
          <CardContent className="p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-surface-50">Demande soumise !</h2>
            <p className="mt-2 text-surface-400">Votre demande a été envoyée à l'administration. Vous recevrez une notification une fois approuvé.</p>
            <Button variant="outline" className="mt-6">
              <Link href="/dashboard">Retour au tableau de bord</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-surface-50">Devenir vendeur</h1>
        <p className="mt-2 text-surface-400">Rejoignez notre réseau de vendeurs et gagnez sur chaque recharge</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Users, title: "Rejoignez la communauté", desc: "Des milliers de gamers attendent vos services." },
          { icon: Shield, title: "Vendez en toute sécurité", desc: "Votre argent est sécurisé par notre système de paiement." },
          { icon: Store, title: "Gagnez des commissions", desc: "Gagnez sur chaque recharge effectuée par vos clients." },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-surface-700 bg-surface-800 text-center card-hover">
              <CardContent className="p-6">
                <Icon className="mx-auto h-10 w-10 text-brand-400 mb-4" />
                <h3 className="text-lg font-semibold text-surface-50">{item.title}</h3>
                <p className="mt-2 text-sm text-surface-400">{item.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isAuthenticated ? (
        <Card className="border-surface-700 bg-surface-800">
          <CardHeader>
            <CardTitle>Formulaire de candidature</CardTitle>
            <CardDescription>Remplissez le formulaire ci-dessous pour devenir vendeur</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium text-surface-200">Numéro de téléphone *</Label>
                  <Input name="phone" required placeholder="+509 XXX XXX XXX" className="mt-1" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-surface-200">Ville *</Label>
                  <Input name="city" required placeholder="Port-au-Prince, Cap-Africaen..." className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-surface-200">Zone / Commune</Label>
                <Input name="zone" placeholder="Zone ou commune" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium text-surface-200">Expérience (mois)</Label>
                <Input name="experience" type="number" placeholder="6" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium text-surface-200">Pourquoi vouloir devenir vendeur ?</Label>
                <textarea name="reason" rows={4} placeholder="Décrivez votre expérience..." className="mt-1 flex w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
              </div>
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Soumettre ma candidature
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Alert variant="info">
          <AlertDescription>
            Vous devez être connecté pour devenir vendeur.{" "}
            <Link href="/auth/login" className="font-medium text-brand-400 hover:underline">
              Se connecter
            </Link>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}