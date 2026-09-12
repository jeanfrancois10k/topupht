"use client";
// @ts-nocheck

import { useAuth } from "@/hooks/use-auth";
import { NavLink } from "./nav-link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Gamepad2,
  ShoppingBag,
  Wallet,
  User,
  Gift,
  HelpCircle,
  Tag,
  Store,
  Package,
  Activity,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const isSeller = profile?.role === "SELLER" || profile?.role === "PRO_SELLER" || profile?.role === "PARTNER";
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN" || profile?.email?.startsWith("admin@");

  const gamerLinks = [
    { href: "/games", label: "Jeux & Services", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/wallet", label: "Portefeuille", icon: <Wallet className="h-4 w-4" /> },
    { href: "/promotions", label: "Promotions", icon: <Gift className="h-4 w-4" /> },
    { href: "/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
  ];

  const sellerLinks = [
    { href: "/seller", label: "Dashboard Vendeur", icon: <Store className="h-4 w-4" /> },
    { href: "/seller/products", label: "Produits", icon: <Package className="h-4 w-4" /> },
    { href: "/seller/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/seller/wallet", label: "Portefeuille", icon: <Wallet className="h-4 w-4" /> },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard Admin", icon: <ShieldAlert className="h-4 w-4 text-red-400" /> },
    { href: "/admin/games", label: "Créer Jeux & Services", icon: <Gamepad2 className="h-4 w-4 text-brand-400" /> },
    { href: "/admin/products", label: "Créer Produits & Prix", icon: <Package className="h-4 w-4 text-emerald-400" /> },
    { href: "/admin/orders", label: "Valider Commandes", icon: <ShoppingBag className="h-4 w-4 text-orange-400" /> },
    { href: "/admin/users", label: "Utilisateurs", icon: <User className="h-4 w-4" /> },
    { href: "/admin/sellers", label: "Vendeurs", icon: <Store className="h-4 w-4" /> },
    { href: "/admin/marketplace", label: "Marketplace Admin", icon: <Tag className="h-4 w-4" /> },
    { href: "/admin/settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-surface-950">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-surface-700 bg-surface-900 px-4 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="TOPUP+" className="h-8 object-contain" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/games" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white">
            Catalogue Jeux & Services
          </Link>
          
          {isAuthenticated && (
            <>
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 rounded-xl bg-red-600/20 border border-red-500/40 px-3.5 py-1.5 text-sm font-bold text-red-400 hover:bg-red-600/30 transition-all shadow-sm"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Dashboard Admin
                </Link>
              )}
              
              <Link
                href="/dashboard"
                className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white"
              >
                Mon Espace
              </Link>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link href="/find-seller" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white">Trouver un vendeur</Link>
              <Link href="/support" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white">Support</Link>
              <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white">Se connecter</Link>
              <Link href="/auth/register" className="rounded-lg px-3.5 py-1.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all">S'inscrire</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>

          {user && (
            <div className="flex items-center gap-2">
              <Avatar src={user.avatar_url ?? undefined} alt={user.full_name ?? user.email ?? "User"} />
              <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 text-surface-400 hover:text-white">
                <User className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-xs" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-surface-900 border-r border-surface-700 overflow-y-auto p-4 space-y-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="absolute right-2 top-2 h-8 w-8 text-surface-400">
              <X className="h-4 w-4" />
            </Button>
            
            {isAdmin && (
              <div className="mb-4 pb-3 border-b border-surface-700 space-y-1">
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider px-2">Espace Admin</p>
                {adminLinks.map((link) => (
                  <NavLink key={link.href} href={link.href} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </NavLink>
                ))}
              </div>
            )}

            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wider px-2">Menu Principal</p>
            {gamerLinks.map((link) => (
              <NavLink key={link.href} href={link.href} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        {isAuthenticated && (
          <aside className={`${sidebarCollapsed ? "w-16" : "w-64"} relative hidden h-full flex-col border-r border-surface-700 bg-surface-900 transition-all duration-200 lg:flex shrink-0`}>
            <div className="flex h-12 items-center border-b border-surface-700 px-4">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-surface-400">
                  {isAdmin ? "🛡️ Navigation Administration" : isSeller ? "🏬 Espace Vendeur" : "🎮 Mon Compte"}
                </span>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
              {isAdmin && (
                <>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-red-400 tracking-wider">
                    {!sidebarCollapsed && "Administration"}
                  </div>
                  {adminLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} icon={link.icon}>
                      {!sidebarCollapsed && link.label}
                    </NavLink>
                  ))}
                  <div className="my-2 border-t border-surface-800" />
                </>
              )}

              {isSeller && (
                <>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase text-htg-400 tracking-wider">
                    {!sidebarCollapsed && "Vendeur"}
                  </div>
                  {sellerLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} icon={link.icon}>
                      {!sidebarCollapsed && link.label}
                    </NavLink>
                  ))}
                  <div className="my-2 border-t border-surface-800" />
                </>
              )}

              <div className="px-2 py-1 text-[10px] font-bold uppercase text-surface-400 tracking-wider">
                {!sidebarCollapsed && "Utilisateur"}
              </div>
              {gamerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>
                  {!sidebarCollapsed && link.label}
                </NavLink>
              ))}
            </nav>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-14 flex h-6 w-6 items-center justify-center rounded-full border border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-50 cursor-pointer shadow-md"
            >
              {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </aside>
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto bg-surface-950 ${isAuthenticated ? "pb-20 p-4 lg:p-6" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}