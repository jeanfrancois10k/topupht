"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/stores/auth-store";
import { NavLink } from "./nav-link";
import { Avatar } from "@/components/ui/avatar";
import { WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Home,
  Gamepad2,
  ShoppingBag,
  Wallet,
  User,
  Gift,
  HelpCircle,
  Tag,
  Store,
  PlusCircle,
  Settings,
  BarChart3,
  Users,
  Package,
  Activity,
  Shield,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getRoleLabel, getRoleColor } from "@/lib/utils";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, isLoading, isAuthenticated, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isSeller = profile?.role === "SELLER" || profile?.role === "PRO_SELLER" || profile?.role === "PARTNER";
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const gamerLinks = [
    { href: "/dashboard", label: "Tableau de bord", icon: <Home className="h-4 w-4" /> },
    { href: "/games", label: "Jeux", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/wallet", label: "Portefeuille", icon: <WalletIcon className="h-4 w-4" /> },
    { href: "/promotions", label: "Promotions", icon: <Gift className="h-4 w-4" /> },
    { href: "/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
  ];

  const sellerLinks = [
    { href: "/seller", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/seller/products", label: "Produits", icon: <Package className="h-4 w-4" /> },
    { href: "/seller/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/seller/wallet", label: "Portefeuille", icon: <WalletIcon className="h-4 w-4" /> },
    { href: "/seller/commissions", label: "Commissions", icon: <Activity className="h-4 w-4" /> },
    { href: "/seller/withdrawals", label: "Retraits", icon: <Tag className="h-4 w-4" /> },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Tableau de bord", icon: <BarChart3 className="h-4 w-4" /> },
    { href: "/admin/users", label: "Utilisateurs", icon: <Users className="h-4 w-4" /> },
    { href: "/admin/sellers", label: "Vendeurs", icon: <Store className="h-4 w-4" /> },
    { href: "/admin/games", label: "Jeux", icon: <Gamepad2 className="h-4 w-4" /> },
    { href: "/admin/products", label: "Produits", icon: <Package className="h-4 w-4" /> },
    { href: "/admin/orders", label: "Commandes", icon: <ShoppingBag className="h-4 w-4" /> },
    { href: "/admin/wallets", label: "Portefeuilles", icon: <WalletIcon className="h-4 w-4" /> },
    { href: "/admin/withdrawals", label: "Retraits", icon: <Tag className="h-4 w-4" /> },
    { href: "/admin/commissions", label: "Commissions", icon: <Activity className="h-4 w-4" /> },
    { href: "/admin/support", label: "Support", icon: <HelpCircle className="h-4 w-4" /> },
    { href: "/admin/audit", label: "Audit", icon: <Shield className="h-4 w-4" /> },
    { href: "/admin/reports", label: "Rapports", icon: <FileText className="h-4 w-4" /> },
    { href: "/admin/settings", label: "Paramètres", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-16" : "w-60"} relative hidden h-full flex-col border-r border-surface-700 bg-surface-900 transition-all duration-200 lg:flex`}>
        <div className="flex h-16 items-center justify-center border-b border-surface-700">
          {!sidebarCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">GAME TOP-UP</span>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {isAdmin && (
            <>
              <p className={`px-3 text-[10px] font-semibold uppercase tracking-wider text-surface-500 ${sidebarCollapsed ? "" : ""}`}>Administration</p>
              {adminLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>{!sidebarCollapsed && link.label}</NavLink>
              ))}
              <Separator className="my-3" />
            </>
          )}

          {isSeller && (
            <>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-surface-500">Vendeur</p>
              {sellerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>{!sidebarCollapsed && link.label}</NavLink>
              ))}
              <Separator className="my-3" />
            </>
          )}

          {!isAdmin && !isSeller && (
            <>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-surface-500">Navigation</p>
              {gamerLinks.map((link) => (
                <NavLink key={link.href} href={link.href} icon={link.icon}>{!sidebarCollapsed && link.label}</NavLink>
              ))}
              <Separator className="my-3" />
            </>
          )}
        </nav>

        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-surface-700 bg-surface-800 text-surface-400 hover:text-white">
          {sidebarCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-surface-700 bg-surface-900 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {sidebarCollapsed && (
              <button onClick={() => setSidebarCollapsed(false)} className="lg:hidden">
                <ChevronRight className="h-5 w-5 text-surface-400" />
              </button>
            )}
            <div className="md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                <Avatar src={user.avatar_url ?? undefined} alt={user.full_name ?? user.email ?? "User"} />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-surface-200">{user.full_name ?? user.email}</p>
                  <p className={`text-xs ${getRoleColor(user.role ?? "GAMER")} rounded-full px-2 py-0.5 inline-block`}>{getRoleLabel(user.role ?? "GAMER")}</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={signOut}>
              <User className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-surface-950 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function Separator({ className }: { className?: string }) {
  return <hr className={`border-surface-700 my-3 ${className ?? ""}`} />;
}