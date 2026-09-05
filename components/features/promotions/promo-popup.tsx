"use client";

import { useState, useEffect } from "react";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600 * 8 + 49 * 60 + 8); // Example: 08:49:08

  useEffect(() => {
    // Check if user has already seen/closed it today
    const hasSeenPromo = localStorage.getItem("topup_promo_closed");
    if (!hasSeenPromo) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("topup_promo_closed", "true");
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")} : ${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="relative w-full max-w-md animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-surface-950 shadow-lg hover:bg-surface-100 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Content */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-b from-htg-400 to-htg-500 shadow-2xl p-1">
          <div className="rounded-xl bg-white p-6 relative">
            {/* Sparkles decoration */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 text-htg-400 text-2xl">✨</div>
            <div className="absolute bottom-10 left-0 -ml-3 text-htg-400 text-xl">✨</div>

            <h3 className="text-xl font-extrabold text-surface-950 text-center mb-4">
              Coupons de bienvenue
            </h3>

            <div className="space-y-3 mb-6">
              {/* Coupon 1 */}
              <div className="relative flex items-center overflow-hidden rounded-xl border border-htg-200 bg-orange-50/50 p-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-htg-600">8% OFF</span>
                    <span className="text-xs font-semibold text-surface-500">(Jusqu'à 10.00$)</span>
                  </div>
                  <p className="mt-1 text-xs text-surface-400">Valide pour les achats &gt; 0.01$</p>
                  <div className="mt-2 inline-block rounded border border-htg-200 border-dashed px-2 py-0.5 text-[10px] font-bold text-htg-600">
                    Nouveau Client
                  </div>
                </div>
                <div className="ml-4 shrink-0 opacity-80">
                  <Gift className="h-10 w-10 text-htg-400" />
                </div>
              </div>

              {/* Coupon 2 */}
              <div className="relative flex items-center overflow-hidden rounded-xl border border-htg-200 bg-orange-50/50 p-4 shadow-sm">
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-htg-600">6% OFF</span>
                    <span className="text-xs font-semibold text-surface-500">(Jusqu'à 6.00$)</span>
                  </div>
                  <p className="mt-1 text-xs text-surface-400">Valide pour les achats &gt; 0.01$</p>
                  <div className="mt-2 inline-block rounded border border-htg-200 border-dashed px-2 py-0.5 text-[10px] font-bold text-htg-600">
                    Tous
                  </div>
                </div>
                <div className="ml-4 shrink-0 opacity-80">
                  <Gift className="h-10 w-10 text-htg-400" />
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs font-medium text-surface-500 mb-2">Expire dans :</p>
              <div className="inline-flex gap-1 rounded-lg bg-surface-100 p-2 font-mono text-lg font-bold text-surface-900">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          <div className="bg-htg-500 p-4 text-center">
            <Button
              size="lg"
              className="w-full bg-surface-950 text-white hover:bg-surface-800 rounded-xl h-14 text-lg font-bold shadow-lg cursor-pointer"
              onClick={handleClose}
            >
              Récupérer TOUT
            </Button>
            <p className="mt-2 text-xs text-white/80 font-medium">Connectez-vous pour utiliser les coupons</p>
          </div>
        </div>
      </div>
    </div>
  );
}
