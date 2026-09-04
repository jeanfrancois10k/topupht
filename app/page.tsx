import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hero } from "@/components/features/home/hero";
import { PopularGames } from "@/components/features/home/popular-games";
import { HowItWorks } from "@/components/features/home/how-it-works";
import { WhyChooseUs } from "@/components/features/home/why-choose-us";
import { Footer } from "@/components/layout/footer";
import { MainLayout } from "@/components/layout/main-layout";
import { Gamepad2, Store, Gift, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "TOPUP+",
  description: "TOPUP+ est la plateforme de référence pour vos recharges en ligne. Achetez rapidement vos diamants et crédits pour Free Fire, Mobile Legends, PUBG, Roblox et bien d'autres. Pas de moyen de paiement ? Trouvez un vendeur de confiance.",
  keywords: ["recharge jeux", "diamants free fire", "top-up jeux", "mobile legends", "pubg", "roblox"],
};

export default function HomePage() {
  return (
    <MainLayout>
      <Hero />
      <PopularGames />
      <HowItWorks />
      <WhyChooseUs />

      <section className="border-t border-surface-800 bg-surface-950 py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Devenir vendeur</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-surface-700 bg-surface-800">
              <CardContent className="p-6">
                <Store className="mx-auto h-10 w-10 text-brand-400 mb-4" />
                <h3 className="text-lg font-semibold text-white text-center">Rejoignez la communauté</h3>
                <p className="mt-2 text-sm text-surface-400 text-center">Des milliers de gamers attendent vos services.</p>
              </CardContent>
            </Card>
            <Card className="border-surface-700 bg-surface-800">
              <CardContent className="p-6">
                <Gift className="mx-auto h-10 w-10 text-htg-400 mb-4" />
                <h3 className="text-lg font-semibold text-white text-center">Gagnez sur chaque recharge</h3>
                <p className="mt-2 text-sm text-surface-400 text-center">Empochez une marge sur chaque vente.</p>
              </CardContent>
            </Card>
            <Card className="border-surface-700 bg-surface-800">
              <CardContent className="p-6">
                <Users className="mx-auto h-10 w-10 text-indigo-400 mb-4" />
                <h3 className="text-lg font-semibold text-white text-center">Support local</h3>
                <p className="mt-2 text-sm text-surface-400 text-center">Une équipe africaenne à votre écoute.</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Button size="lg">
              <Link href="/become-seller">Devenir vendeur</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-surface-800 bg-surface-950 py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Trouver un vendeur</h2>
          <p className="mt-2 text-center text-surface-400">Trouvez un vendeur de confiance près de chez vous.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-surface-700 bg-surface-800">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">JV</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Jean-Victor</p>
                    <p className="text-xs text-surface-400">Port-au-Prince</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-surface-700 bg-surface-800">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-htg-600/20 text-htg-400">SM</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Sophie</p>
                    <p className="text-xs text-surface-400">Cap-Africaen</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-surface-700 bg-surface-800">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600/20 text-purple-400">MD</div>
                  <div>
                    <p className="text-sm font-semibold text-white">Marc</p>
                    <p className="text-xs text-surface-400">Les Cayes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </MainLayout>
  );
}