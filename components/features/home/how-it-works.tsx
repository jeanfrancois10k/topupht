import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoveHorizontal, CreditCard, Package, CheckCircle } from "lucide-react";

export function HowItWorks() {
  const steps = [
    { icon: MoveHorizontal, title: "Choisir un jeu", description: "Parcours notre catalogue de jeux populaires comme Free Fire, PUBG, Mobile Legends et plus." },
    { icon: CreditCard, title: "Payer", description: "Effectue ton paiement en GNF via MonCash, NatCash ou trouve un vendeur près de chez toi." },
    { icon: Package, title: "Recharger", description: "Ton top-up est traité automatiquement et tes diamants/crédits sont livrés instantanément." },
    { icon: CheckCircle, title: "C'est prêt", description: "Profite de ton crédit et joue sans interruption. Notre support est là si besoin." },
  ];

  return (
    <section className="border-t border-surface-800 bg-surface-950 py-16">
      <div className="container-custom">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Comment ça marche</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="border-surface-700 bg-surface-800 text-center">
                <CardContent className="p-6">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-600/20 text-brand-400 mb-4">
                    <Icon className="h-7 w-7" />
                  </div>
                  <span className="mb-2 inline-block rounded-full bg-surface-700 px-3 py-0.5 text-xs font-bold text-brand-400">Étape {index + 1}</span>
                  <CardTitle className="mt-3 text-white">{step.title}</CardTitle>
                  <p className="mt-2 text-sm text-surface-400">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}