import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";
import { AuthProvider } from "@/components/features/auth/auth-provider";

export const metadata: Metadata = {
  title: {
    default: "Game Top-Up",
    template: "%s | Game Top-Up",
  },
  description: "La plateforme #1 de recharge de jeux à Africa. Achète tes diamants et crédits rapidement.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_PLATFORM_URL || "http://localhost:3000"),
  openGraph: {
    title: "Game Top-Up",
    description: "La plateforme #1 de recharge de jeux à Africa.",
    type: "website",
    locale: "fr_HT",
    siteName: "Game Top-Up",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-surface-950 text-surface-50 antialiased">
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}