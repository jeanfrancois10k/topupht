"use client";

import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/config/supabase";
import { useGameStore } from "@/stores/game-store";
import type { Game, Product } from "@/types/shared";
import { generateId } from "@/lib/utils";

export function useGames() {
  const { games, selectedGame, filteredProducts, isLoading, setGames, setSelectedGame, setFilteredProducts, setLoading, getActiveGames, getProductById } = useGameStore();

  useEffect(() => {
    async function fetchGames() {
      try {
        const { data, error } = await supabaseClient.from("games").select("*").eq("status", "ACTIVE").order("display_order", { ascending: true });
        if (error) throw error;
        setGames(data ?? []);
      } catch {
        setLoading(false);
      }
    }
    fetchGames();
    
  }, []);

  const fetchProducts = useCallback(async (gameId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabaseClient.from("game_products").select("*").eq("game_id", gameId).eq("status", "ACTIVE");
      if (error) throw error;
      setFilteredProducts((data ?? []) as Product[]);
    } catch {
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectGame = useCallback((game: Game | null) => {
    setSelectedGame(game);
    if (game) {
      fetchProducts(game.id);
    } else {
      setFilteredProducts([]);
    }
  }, []);

  const fetchGames = useCallback(async () => {
    try {
      const { data, error } = await supabaseClient.from("games").select("*").eq("status", "ACTIVE").order("display_order", { ascending: true });
      if (error) throw error;
      setGames(data ?? []);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, []);

  return {
    games,
    selectedGame,
    filteredProducts,
    isLoading,
    getActiveGames,
    getProductById,
    selectGame,
    fetchProducts,
    fetchGames,
  };
}