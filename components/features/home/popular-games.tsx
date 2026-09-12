// @ts-nocheck
import { supabaseClient } from "@/config/supabase";
import Link from "next/link";
import { Gamepad2, ChevronRight } from "lucide-react";

const DEFAULT_CATALOG = [
  { id: "ff", name: "Free Fire", slug: "free-fire", icon: "🔥", badge: "Populaire" },
  { id: "ml", name: "Mobile Legends", slug: "mobile-legends", icon: "⚔️", badge: "Populaire" },
  { id: "chatgpt", name: "ChatGPT Plus", slug: "chatgpt-plus", icon: "🤖", badge: "IA Abonnement" },
  { id: "claude", name: "Claude Pro", slug: "claude-pro", icon: "🧠", badge: "IA Abonnement" },
  { id: "gemini", name: "Gemini Advanced", slug: "gemini-advanced", icon: "✨", badge: "IA Abonnement" },
  { id: "pubg", name: "PUBG Mobile", slug: "pubg", icon: "🎯", badge: "Jeux" },
  { id: "roblox", name: "Roblox", slug: "roblox", icon: "🟡", badge: "Jeux" },
  { id: "cod", name: "Call of Duty", slug: "cod-mobile", icon: "💥", badge: "Jeux" },
];

async function getActiveGames() {
  try {
    const { data, error } = await supabaseClient
      .from("games")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })
      .limit(16);
    if (error) throw error;
    if (data && data.length > 0) return data;
    return DEFAULT_CATALOG;
  } catch {
    return DEFAULT_CATALOG;
  }
}

export async function PopularGames() {
  const games = await getActiveGames();

  return (
    <section className="bg-surface-950 py-10 border-t border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">Services & Jeux Populaires</h2>
            <p className="text-xs sm:text-sm text-surface-400 mt-0.5">Recharges instantanées de jeux et abonnements numériques (IA, Streaming)</p>
          </div>
          <Link
            href="/games"
            className="flex items-center gap-1 text-sm font-semibold text-htg-400 hover:text-htg-300 transition-colors"
          >
            Voir tous <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Catalog Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3.5">
          {games.map((game) => (
            <Link
              key={game.id || game.slug}
              href={`/games/${game.slug}`}
              className="group flex flex-col items-center gap-2"
            >
              {/* Card */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-900 border border-surface-700 group-hover:border-red-500 transition-all duration-200 shadow-md group-hover:shadow-red-500/20 group-hover:scale-105 flex flex-col items-center justify-center p-3">
                {game.cover_url || game.logo_url ? (
                  <img
                    src={game.cover_url || game.logo_url}
                    alt={game.name}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center">
                    <span className="text-4xl drop-shadow-md">{game.icon || "🎮"}</span>
                  </div>
                )}

                {/* Optional Tag Badge */}
                {game.badge && (
                  <div className="absolute top-2 left-2 bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {game.badge}
                  </div>
                )}
                
                {/* Subtle gradient overlay */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <span className="text-xs font-bold text-surface-200 group-hover:text-white text-center line-clamp-1 transition-colors">
                {game.name}
              </span>
            </Link>
          ))}
        </div>

        {/* Services Row */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "🔥", label: "Recharges de Jeux", href: "/games", color: "from-red-600/20 to-red-900/10", border: "border-red-700/30" },
            { icon: "🤖", label: "Abonnements IA & Dev", href: "/games", color: "from-purple-600/20 to-purple-900/10", border: "border-purple-700/30" },
            { icon: "🛍️", label: "Marketplace Comptes", href: "/marketplace", color: "from-teal-600/20 to-teal-900/10", border: "border-teal-700/30" },
            { icon: "🤝", label: "Marchands Haïti", href: "/find-seller", color: "from-blue-600/20 to-blue-900/10", border: "border-blue-700/30" },
          ].map((service) => (
            <Link
              key={service.label}
              href={service.href}
              className={`group flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-gradient-to-br ${service.color} border ${service.border} hover:scale-105 transition-all hover:shadow-lg`}
            >
              <span className="text-3xl">{service.icon}</span>
              <span className="text-xs font-bold text-white/80 group-hover:text-white text-center transition-colors">
                {service.label}
              </span>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}