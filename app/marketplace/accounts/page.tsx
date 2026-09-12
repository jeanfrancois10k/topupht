"use client";
// @ts-nocheck

import { useEffect, useState } from "react";
import { supabaseClient } from "@/config/supabase";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import {
  Gamepad2, Trophy, Star, ShieldCheck, Search,
  Plus, Filter, Sword, Clock, TrendingUp
} from "lucide-react";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  SALE: "Vente",
  RENTAL: "Location",
};

const TYPE_COLORS: Record<string, string> = {
  SALE: "bg-green-100 text-green-700 border-green-200",
  RENTAL: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function GameAccountsMarketplacePage() {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [games, setGames] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [{ data: gamesData }, { data: accountsData }] = await Promise.all([
      supabaseClient.from("games").select("id, name, logo_url").eq("is_active", true).order("display_order"),
      supabaseClient
        .from("game_accounts")
        .select("*, games(name, logo_url)")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false }),
    ]);
    if (gamesData) setGames(gamesData);
    if (accountsData) setAccounts(accountsData);
    setIsLoading(false);
  }

  const filtered = accounts.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchGame = !selectedGame || a.game_id === selectedGame;
    const matchType = !selectedType || a.type === selectedType;
    return matchSearch && matchGame && matchType;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-surface-950 via-surface-900 to-surface-800 shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-htg-400 to-transparent" />
        </div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl text-center md:text-left">
            <Badge className="mb-4 bg-htg-500/20 text-htg-300 border-htg-500/30 font-bold px-4 py-1">
              🎮 Nouveau sur TOPUP+
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              Marketplace <span className="text-htg-400">Comptes Gaming</span>
            </h1>
            <p className="mt-4 text-surface-300 text-lg">
              Achetez ou louez des comptes de jeux vérifiés. Transactions 100% sécurisées par TOPUP+.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
              <Link href="/marketplace/accounts/submit">
                <Button className="bg-htg-500 hover:bg-htg-600 text-white font-bold h-12 px-8 rounded-full shadow-lg shadow-htg-500/20 gap-2">
                  <Plus className="h-5 w-5" /> Vendre / Louer mon compte
                </Button>
              </Link>
              <div className="flex items-center text-surface-400 text-sm font-medium gap-1.5">
                <ShieldCheck className="h-5 w-5 text-green-400" /> Escrow sécurisé
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 shrink-0">
            {[
              { icon: Gamepad2, label: "Jeux", value: games.length },
              { icon: ShieldCheck, label: "Sécurisé", value: "100%" },
              { icon: TrendingUp, label: "Commission", value: "10%" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-white/5 border border-white/10 rounded-2xl p-4">
                <stat.icon className="h-6 w-6 text-htg-400 mx-auto mb-1" />
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input
            placeholder="Rechercher un compte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Game filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGame("")}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
              !selectedGame ? "bg-htg-500 text-white border-htg-500" : "border-surface-200 text-surface-600 hover:border-htg-300"
            }`}
          >
            Tous
          </button>
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(selectedGame === g.id ? "" : g.id)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all flex items-center gap-1.5 ${
                selectedGame === g.id ? "bg-htg-500 text-white border-htg-500" : "border-surface-200 text-surface-600 hover:border-htg-300"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2">
          {["SALE", "RENTAL"].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(selectedType === t ? "" : t)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                selectedType === t
                  ? t === "SALE" ? "bg-green-500 text-white border-green-500" : "bg-blue-500 text-white border-blue-500"
                  : "border-surface-200 text-surface-600 hover:border-surface-300"
              }`}
            >
              {t === "SALE" ? "💰 Vente" : "⏱️ Location"}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-10 w-10 text-htg-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Gamepad2 className="mx-auto h-16 w-16 text-surface-300 mb-4" />
          <h2 className="text-xl font-bold text-surface-700">Aucun compte disponible</h2>
          <p className="text-surface-400 mt-2">Soyez le premier à publier un compte !</p>
          <Link href="/marketplace/accounts/submit">
            <Button className="mt-6 bg-htg-500 hover:bg-htg-600 text-white font-bold rounded-full gap-2">
              <Plus className="h-4 w-4" /> Publier un compte
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((account) => (
            <Card key={account.id} className="overflow-hidden border-surface-200 hover:border-htg-300 hover:shadow-xl transition-all group cursor-pointer flex flex-col">
              <Link href={`/marketplace/accounts/${account.id}`} className="flex flex-col h-full">
                {/* Game header */}
                <div className="bg-gradient-to-r from-surface-950 to-surface-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                      {account.games?.logo_url ? (
                        <img src={account.games.logo_url} alt="" className="h-6 w-6 object-contain" />
                      ) : (
                        <Gamepad2 className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span className="text-xs text-surface-400 font-bold uppercase tracking-wider">{account.games?.name}</span>
                  </div>
                  <Badge className={`text-xs font-bold border ${TYPE_COLORS[account.type]}`}>
                    {account.type === "SALE" ? "💰" : "⏱️"} {TYPE_LABELS[account.type]}
                  </Badge>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-surface-950 line-clamp-2 text-sm leading-snug">{account.title}</h3>

                  {/* Stats */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {account.rank && (
                      <span className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-700 rounded-full px-2 py-0.5 font-semibold">
                        <Trophy className="h-3 w-3" /> {account.rank}
                      </span>
                    )}
                    {account.skins_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-purple-50 border border-purple-200 text-purple-700 rounded-full px-2 py-0.5 font-semibold">
                        <Star className="h-3 w-3" /> {account.skins_count} skins
                      </span>
                    )}
                    {account.heroes_count > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-2 py-0.5 font-semibold">
                        <Sword className="h-3 w-3" /> {account.heroes_count} héros
                      </span>
                    )}
                  </div>

                  {/* Highlights */}
                  {account.highlights && account.highlights.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {account.highlights.slice(0, 2).map((h: string, i: number) => (
                        <p key={i} className="text-xs text-surface-500 flex items-center gap-1">
                          <span className="text-green-500">✓</span> {h}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-100">
                    <div>
                      <p className="text-xs text-surface-400 font-medium">
                        {account.type === "RENTAL" ? "Prix/jour" : "Prix"}
                      </p>
                      <p className="text-lg font-black text-htg-600">
                        {formatCurrency(account.type === "RENTAL" ? account.rental_price_per_day : account.price, account.currency)}
                        {account.type === "RENTAL" && <span className="text-xs font-normal text-surface-400">/jour</span>}
                      </p>
                    </div>
                    <Button size="sm" className="bg-surface-950 hover:bg-htg-600 text-white font-bold text-xs rounded-lg gap-1 group-hover:bg-htg-500 transition-colors">
                      {isAuthenticated ? "Voir" : "Connexion"}
                    </Button>
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
