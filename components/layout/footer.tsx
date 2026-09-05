import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="container-custom py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="TOPUP+" className="h-8 object-contain" />
            </div>
            <p className="mt-3 text-sm text-surface-400">La plateforme #1 de recharge de jeux en Haïti.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-50">Navigation</h4>
            <div className="mt-4 space-y-2">
              <Link href="/games" className="block text-sm text-surface-400 hover:text-brand-400">Jeux</Link>
              <Link href="/become-seller" className="block text-sm text-surface-400 hover:text-brand-400">Devenir vendeur</Link>
              <Link href="/find-seller" className="block text-sm text-surface-400 hover:text-brand-400">Trouver un vendeur</Link>
              <Link href="/support" className="block text-sm text-surface-400 hover:text-brand-400">Support</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-50">Contact</h4>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-surface-400">support@topup.com</p>
              <p className="text-sm text-surface-400">+509 XXX XXX XXX</p>
              <Badge variant="warning">Disponible 7j/7</Badge>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-surface-50">Réseaux</h4>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-surface-400">Suivez-nous sur les réseaux sociaux</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm"><Link href="#">Facebook</Link></Button>
                <Button variant="outline" size="sm"><Link href="#">WhatsApp</Link></Button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-surface-800 pt-6 text-center">
          <p className="text-xs text-surface-500">© {new Date().getFullYear()} TOPUP+. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}