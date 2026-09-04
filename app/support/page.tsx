"use client";
// @ts-nocheck

import { useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";

export default function SupportPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !subject || !description) return;
    setIsSubmitting(true);
    try {
      await supabaseClient.from("support_tickets").insert({
        user_id: profile?.id,
        category,
        subject,
        description,
        order_id: orderId || null,
        status: "OPEN",
        priority: "MEDIUM",
      } as any);
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
            <HelpCircle className="mx-auto h-12 w-12 text-htg-400" />
            <h2 className="mt-4 text-xl font-bold text-white">Ticket créé !</h2>
            <p className="mt-2 text-surface-400">Notre équipe vous répondra dans les plus brefs délais.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div>
        <h1 className="text-3xl font-bold text-white">Support</h1>
        <p className="mt-1 text-surface-400">Nous contacter pour toute question ou problème</p>
      </div>

      <Card className="border-surface-700 bg-surface-800">
        <CardHeader>
          <CardTitle>Nouveau ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Catégorie</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 flex w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">Sélectionner...</option>
                <option value="TECHNICAL">Problème technique</option>
                <option value="PAYMENT">Paiement</option>
                <option value="ORDER">Commande</option>
                <option value="ACCOUNT">Compte</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <Label>Sujet</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Résumé de votre demande" required className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Décrivez votre problème en détail..." className="mt-1 flex w-full rounded-lg border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
            <div>
              <Label>Référence de commande (optionnel)</Label>
              <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Numéro de commande" className="mt-1" />
            </div>
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Soumettre le ticket
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}