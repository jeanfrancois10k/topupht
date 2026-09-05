"use client";

import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: string[] }) {
  const { isAuthenticated, isLoading, isAdmin, isSeller, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (requireRole && requireRole.length > 0) {
    const userRole = profile?.role ?? "";
    if (!requireRole.includes(userRole) && !requireRole.includes("ADMIN") && !requireRole.includes("SUPER_ADMIN")) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-bold text-surface-50">Accès refusé</p>
            <p className="mt-2 text-surface-400">Vous n'avez pas la permission d'accéder à cette page.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}