export const DATABASE_CONFIG = {
  schema: "public" as const,
  migrationsPath: "./migrations",
  seedsPath: "./seeds",
  connection: {
    // Connection settings managed via Supabase
    // Do not hardcode credentials
  },
} as const;

export const MIGRATION_TABLE = "supabase_migrations";

export const ROLES = {
  GAMER: "GAMER",
  SELLER: "SELLER",
  PRO_SELLER: "PRO_SELLER",
  PARTNER: "PARTNER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export const ORDER_STATUSES = {
  PENDING: "PENDING",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  REFUND_PENDING: "REFUND_PENDING",
  REFUNDED: "REFUNDED",
  CANCELLED: "CANCELLED",
} as const;

export const WALLET_TRANSACTION_TYPES = {
  DEPOSIT: "DEPOSIT",
  PURCHASE: "PURCHASE",
  TOPUP: "TOPUP",
  REFUND: "REFUND",
  COMMISSION: "COMMISSION",
  WITHDRAWAL: "WITHDRAWAL",
  ADJUSTMENT: "ADJUSTMENT",
  BONUS: "BONUS",
  REVERSAL: "REVERSAL",
} as const;

export const SELLER_LEVELS = {
  STANDARD: "STANDARD",
  PRO: "PRO",
  PARTNER: "PARTNER",
} as const;

export const CURRENCIES = {
  HTG: "HTG",
  USD: "USD",
  DOP: "DOP",
} as const;