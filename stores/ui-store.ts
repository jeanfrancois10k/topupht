import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  theme: "dark";
  notifications: Array<{ id: string; title: string; message: string; type: string; read: boolean }>;
  unreadCount: number;
  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  addNotification: (notification: Omit<UiState["notifications"][number], "id">) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: "dark",
  notifications: [],
  unreadCount: 0,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [{ ...notification, id: crypto.randomUUID(), read: false }, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 })),
}));