import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Currency } from "@/types/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number, currency: Currency = "HTG"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const formatted = new Intl.NumberFormat("ht-HT", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
  return formatted;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("ht-HT").format(num);
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GT-${date}-${random}`;
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}

export function formatHTG(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${num.toLocaleString("ht-HT")} HTG`;
}

export function parseHTG(amount: string): number {
  return parseFloat(amount.replace(/[^0-9.]/g, ""));
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "...";
}

export function safeGet<T>(obj: unknown, path: string, fallback: T): T {
  const keys = path.split(".");
  let result: unknown = obj;
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return fallback;
    }
  }
  return (result as T) ?? fallback;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "il y a moins d'une minute";
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
  if (seconds < 2592000) return `il y a ${Math.floor(seconds / 86400)} j`;
  return `il y a ${Math.floor(seconds / 2592000)} mois`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PAYMENT_PENDING: "bg-blue-500/20 text-blue-400",
    PROCESSING: "bg-blue-500/20 text-blue-400",
    SUCCESS: "bg-green-500/20 text-green-400",
    FAILED: "bg-red-500/20 text-red-400",
    CANCELLED: "bg-gray-500/20 text-gray-400",
    REFUND_PENDING: "bg-orange-500/20 text-orange-400",
    REFUNDED: "bg-purple-500/20 text-purple-400",
    ACTIVE: "bg-green-500/20 text-green-400",
    INACTIVE: "bg-gray-500/20 text-gray-400",
    PENDING_APPROVAL: "bg-yellow-500/20 text-yellow-400",
    APPROVED: "bg-green-500/20 text-green-400",
    REJECTED: "bg-red-500/20 text-red-400",
    SUSPENDED: "bg-red-500/20 text-red-400",
    ONLINE: "bg-green-500/20 text-green-400",
    OFFLINE: "bg-gray-500/20 text-gray-400",
    DEGRADED: "bg-orange-500/20 text-orange-400",
  };
  return colors[status] ?? "bg-gray-500/20 text-gray-400";
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    GAMER: "Gamer",
    SELLER: "Vendeur",
    PRO_SELLER: "Pro Vendeur",
    PARTNER: "Partenaire",
    ADMIN: "Administrateur",
    SUPER_ADMIN: "Super Admin",
  };
  return labels[role] ?? role;
}

export function getRoleColor(role: string): string {
  const colors: Record<string, string> = {
    GAMER: "bg-blue-500/20 text-blue-400",
    SELLER: "bg-purple-500/20 text-purple-400",
    PRO_SELLER: "bg-indigo-500/20 text-indigo-400",
    PARTNER: "bg-pink-500/20 text-pink-400",
    ADMIN: "bg-red-500/20 text-red-400",
    SUPER_ADMIN: "bg-orange-500/20 text-orange-400",
  };
  return colors[role] ?? "bg-gray-500/20 text-gray-400";
}