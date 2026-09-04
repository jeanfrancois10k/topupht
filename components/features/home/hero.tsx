"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gamepad2, Wallet, Gift, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-950 via-surface-900 to-brand-900/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_60%)]" />
      <div className="relative container-custom py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="warning" className="mb-4 inline-block">🔥 Plateforme #1</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              TOPUP+ — La plateforme de référence pour vos recharges en ligne
            </h1>
            <p className="mt-4 max-w-lg text-lg text-surface-300">
              Achetez rapidement et en toute sécurité vos diamants et crédits pour vos jeux préférés — Free Fire, Mobile Legends, PUBG, Roblox et bien d'autres.
            </p>
            <p className="mt-3 text-base text-surface-400">
              Pas de moyen de paiement international ? Pas de problème : TOPUP+ vous connecte avec des vendeurs de confiance pour finaliser vos achats facilement.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/games">
                <Button size="lg" className="h-12 px-8">
                  <Gamepad2 className="mr-2 h-5 w-5" />
                  Explorer les jeux
                </Button>
              </Link>
              <Link href="/become-seller">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Devenir vendeur
                </Button>
              </Link>
            </div>

            <div className="mt-8 space-y-4">
              <p className="text-sm font-semibold text-htg-400">Bientôt disponible sur TOPUP+ :</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-htg-400" />
                  <span className="text-sm text-surface-300">Recharge de cartes de débit virtuelles (Wise, Mercury, et plus)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-htg-400" />
                  <span className="text-sm text-surface-300">Achat de cartes cadeaux (Netflix, et d'autres marques populaires)</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-surface-700 bg-surface-800/50 p-4">
              <p className="text-sm text-surface-300">
                <Shield className="inline h-4 w-4 text-htg-400 mr-1" />
                Notre mission : faire de TOPUP+ la solution tout-en-un pour tous vos besoins de recharge numérique — jeux, finance et divertissement.
              </p>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative mx-auto aspect-square max-w-md">
              <div className="absolute inset-0 animate-ping rounded-full bg-brand-600/20 blur-xl" />
              <div className="absolute inset-8 flex items-center justify-center rounded-2xl bg-surface-800 border border-surface-700 p-8 shadow-2xl">
                <Gamepad2 className="h-24 w-24 text-brand-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}