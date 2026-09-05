"use client";

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
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const gamerLinks = [
    { href: "/games", label: "Jeux", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/wallet", label: "Portefeuille", icon: <Wallet className="h-4 w-4" /> },
    { href: "/promotions", label: "Promotions", icon: <Gift className="h-4 w-4" /> },
    { href: "/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
  ];

  const sellerLinks = [
    { href: "/seller", label: "Dashboard", icon: <Store className="h-4 w-4" /> },
    { href: "/seller/products", label: "Produits", icon: <Package className="h-4 w-4" /> },
    { href: "/seller/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/seller/wallet", label: "Portefeuille", icon: <Wallet className="h-4 w-4" /> },
    { href: "/seller/commissions", label: "Commissions", icon: <Activity className="h-4 w-4" /> },
    { href: "/seller/withdrawals", label: "Retraits", icon: <Tag className="h-4 w-4" /> },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Tableau de bord", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/admin/users", label: "Utilisateurs", icon: <User className="h-4 w-4" /> },
    { href: "/admin/sellers", label: "Vendeurs", icon: <Store className="h-4 w-4" /> },
    { href: "/admin/games", label: "Jeux", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/admin/products", label: "Produits", icon: <Package className="h-4 w-4" /> },
    { href: "/admin/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/admin/wallets", label: "Portefeuilles", icon: <Wallet className="h-4 w-4" /> },
    { href: "/admin/withdrawals", label: "Retraits", icon: <Tag className="h-4 w-4" /> },
    { href: "/admin/commissions", label: "Commissions", icon: <Activity className="h-4 w-4" /> },
    { href: "/admin/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
    { href: "/admin/audit", label: "Audit", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin/reports", label: "Rapports", icon: <FileText className="h-4 w-4" /> },
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
        <nav className="hidden items-center gap-1 md:flex">
          {isAuthenticated ? (
            <>
              {(isAdmin ? adminLinks.slice(0, 4) : isSeller ? sellerLinks.slice(0, 3) : gamerLinks.slice(0, 3)).map((link) => (
                <Link key={link.href} href={link.href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100">
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <Link href={isAdmin ? "/admin/dashboard" : isSeller ? "/seller" : "/dashboard"} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link href="/games" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100">Jeux</Link>
              <Link href="/find-seller" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100">Trouver un vendeur</Link>
              <Link href="/support" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100">Support</Link>
              <Link href="/auth/login" className="rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-100">Se connecter</Link>
              <Link href="/auth/register" className="rounded-lg px-3 py-2 text-sm font-medium text-brand-400 transition-colors hover:bg-surface-800">S'inscrire</Link>
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
              <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-surface-950" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed left-0 top-16 bottom-0 w-64 bg-surface-900 border-r border-surface-700 overflow-y-auto p-4 space-y-2">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)} className="absolute right-2 top-2 h-8 w-8 text-surface-400">
              <X className="h-4 w-4" />
            </Button>
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login" className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800" onClick={() => setMobileMenuOpen(false)}>Se connecter</Link>
                <Link href="/auth/register" className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-brand-400 transition-colors hover:bg-surface-800" onClick={() => setMobileMenuOpen(false)}>S'inscrire</Link>
                <Link href="/games" className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800" onClick={() => setMobileMenuOpen(false)}>Jeux</Link>
                <Link href="/find-seller" className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800" onClick={() => setMobileMenuOpen(false)}>Trouver un vendeur</Link>
                <Link href="/support" className="block w-full rounded-lg px-3 py-2 text-sm font-medium text-surface-300 transition-colors hover:bg-surface-800" onClick={() => setMobileMenuOpen(false)}>Support</Link>
              </>
            ) : isAdmin ? (
              adminLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>{link.label}</NavLink>
              ))
            ) : isSeller ? (
              sellerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>{link.label}</NavLink>
              ))
            ) : (
              gamerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon} onClick={() => setMobileMenuOpen(false)}>{link.label}</NavLink>
              ))
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar — no logo, only links */}
        {isAuthenticated && (
          <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} relative hidden h-full flex-col border-r border-surface-700 bg-surface-900 transition-all duration-200 lg:flex`}>
            <div className="flex h-16 items-center border-b border-surface-700 px-4">
              {!sidebarCollapsed && (
                <span className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                  {isAdmin ? "Admin" : isSeller ? "Vendeur" : "Menu"}
                </span>
              )}
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {isAdmin && adminLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>{!sidebarCollapsed && link.label}</NavLink>
              ))}
              {isSeller && sellerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>{!sidebarCollapsed && link.label}</NavLink>
              ))}
              {!isAdmin && !isSeller && gamerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>{!sidebarCollapsed && link.label}</NavLink>
              ))}
            </nav>

            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-surface-700 bg-surface-800 text-surface-400 hover:text-surface-50">
              {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
          </aside>
        )}

        {/* Mobile bottom nav */}
        {isAuthenticated && (
          <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-surface-700 bg-surface-900 py-1 md:hidden">
            {(isAdmin ? adminLinks.slice(0, 5) : isSeller ? sellerLinks.slice(0, 5) : gamerLinks.slice(0, 5)).map((link) => (
              <NavLink key={link.href} href={link.href} icon={link.icon} className="flex flex-col items-center gap-0.5 py-1 px-2 text-[10px]">
                <span className="text-[9px]">{link.label}</span>
              </NavLink>
            ))}
          </nav>
        )}

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto bg-surface-950 ${isAuthenticated ? "pb-20 p-4 lg:p-6" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}