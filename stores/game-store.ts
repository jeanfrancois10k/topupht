import { create } from "zustand";
import type { Game, Product } from "@/types/shared";

interface GameStoreState {
  games: Game[];
  selectedGame: Game | null;
  filteredProducts: Product[];
  isLoading: boolean;
  setGames: (games: Game[]) => void;
  setSelectedGame: (game: Game | null) => void;
  setFilteredProducts: (products: Product[]) => void;
  setLoading: (loading: boolean) => void;
  getActiveGames: () => Game[];
  getProductById: (id: string) => Product | undefined;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  games: [],
  selectedGame: null,
  filteredProducts: [],
  isLoading: true,
  setGames: (games) => set({ games }),
  setSelectedGame: (game) => set({ selectedGame: game }),
  setFilteredProducts: (products) => set({ filteredProducts: products }),
  setLoading: (isLoading) => set({ isLoading }),
  getActiveGames: () => get().games.filter((g) => g.is_active && g.status === "ACTIVE"),
  getProductById: (id) => get().filteredProducts.find((p) => p.id === id),
}));