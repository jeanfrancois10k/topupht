import { Metadata } from "next";
import { Hero } from "@/components/features/home/hero";
import { PopularGames } from "@/components/features/home/popular-games";
import { HowItWorks } from "@/components/features/home/how-it-works";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "TOPUP+ Haiti — Recharge de Jeux, Marketplace & Réseau de Marchands",
  description: "TOPUP+ est la plateforme numéro 1 en Haïti pour la recharge de jeux vidéo (Free Fire, Mobile Legends, PUBG, Roblox), l'achat/vente de comptes et l'accès à un réseau de marchands de confiance.",
  keywords: ["recharge jeux", "diamants free fire", "top-up jeux", "mobile legends", "pubg", "roblox", "haiti", "marketplace jeux"],
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <PopularGames />
      <HowItWorks />
      <Footer />
    </>
  );
}