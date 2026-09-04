import { create } from "zustand";
import type { Wallet, WalletTransaction } from "@/types/shared";

interface WalletStoreState {
  wallet: Wallet | null;
  transactions: WalletTransaction[];
  isLoading: boolean;
  setWallet: (wallet: Wallet | null) => void;
  setTransactions: (transactions: WalletTransaction[]) => void;
  setLoading: (loading: boolean) => void;
  updateBalance: (newBalance: string) => void;
  addTransaction: (transaction: WalletTransaction) => void;
}

export const useWalletStore = create<WalletStoreState>((set) => ({
  wallet: null,
  transactions: [],
  isLoading: true,
  setWallet: (wallet) => set({ wallet }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  updateBalance: (newBalance) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance: newBalance } : null,
    })),
  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),
}));