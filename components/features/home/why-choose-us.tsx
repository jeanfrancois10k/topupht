import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CloudLightning, Coins, GlobeIcon } from "lucide-react";

export function WhyChooseUs() {
  const features = [
    { icon: CloudLightning, title: "Recharge instantanée", description: "Recevez vos crédits en quelques secondes grâce à notre système automatisé." },
    { icon: Coins, title: "Paiements flexibles", description: "Payez en GNF via MonCash, NatCash ou devenez vendeur pour acheter à prix réduit." },
    { icon: Shield, title: "100% sécurisé", description: "Chaque transaction est sécurisée et tracée. Votre argent est protégé." },
    { icon: GlobeIcon, title: "Support local", description: "Une équipe africaenne à votre écoute, disponible 7j/7 pour vous assister." },
  ];

  return (
    <section className="border-t border-surface-800 bg-surface-950 py-16">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-surface-50 text-center mb-12">Pourquoi choisir TOPUP+</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-xl border border-surface-700 bg-surface-800 p-6 text-center card-hover">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-htg-600/20 text-htg-400 mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-surface-50">{feature.title}</h3>
                <p className="mt-2 text-sm text-surface-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}