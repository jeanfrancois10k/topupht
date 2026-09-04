"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Gamepad2, Store, Users } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-950 via-surface-900 to-brand-950/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.15),transparent_60%)]" />
      <div className="relative container-custom py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="warning" className="mb-4 inline-block">🔥 En pleine croissance</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Recharge tes jeux{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-red-400">rapidement</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-surface-300">
              Achète des crédits et diamants pour tes jeux préférés à Africa. Paye en GNF avec MonCash, NatCash ou trouve un vendeur de confiance.
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
                  <Store className="mr-2 h-5 w-5" />
                  Devenir vendeur
                </Button>
              </Link>
            </div>
            <div className="mt-6 flex gap-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-htg-400" />
                <span className="text-sm text-surface-300">Des milliers de gamers</span>
              </div>
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-brand-400" />
                <span className="text-sm text-surface-300">Vendeurs vérifiés</span>
              </div>
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