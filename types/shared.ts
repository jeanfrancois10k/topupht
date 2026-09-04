export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface FilterOptions {
  search?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
}

export type UserRole = "GAMER" | "SELLER" | "PRO_SELLER" | "PARTNER" | "ADMIN" | "SUPER_ADMIN";
export type ProfileStatus = "ACTIVE" | "SUSPENDED" | "DELETED";

export interface Money {
  amount: string;
  currency: Currency;
}

export type Currency = "HTG" | "USD" | "DOP";

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  category_id: string | null;
  status: GameStatus;
  display_order: number;
  instructions: string | null;
  required_fields: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type GameStatus = "ACTIVE" | "INACTIVE" | "SOFT_DELETED";

export interface Product {
  id: string;
  game_id: string;
  game: Game | null;
  name: string;
  sku: string;
  provider_id: string | null;
  cost_provider: string | null;
  price_gamer: string;
  price_seller: string | null;
  price_pro_seller: string | null;
  price_partner: string | null;
  currency: string;
  status: ProductStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

export interface Provider {
  id: string;
  name: string;
  slug: string;
  api_name: string | null;
  api_url: string | null;
  is_active: boolean;
  health_status: ProviderHealthStatus;
  balance: string | null;
  last_sync_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type ProviderHealthStatus = "ONLINE" | "OFFLINE" | "DEGRADED" | "UNKNOWN";

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  game_id: string | null;
  product_id: string | null;
  player_id: string | null;
  server_id: string | null;
  amount: string;
  currency: string;
  provider_id: string | null;
  provider_transaction_id: string | null;
  idempotency_key: string | null;
  payment_id: string | null;
  status: OrderStatus;
  metadata: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  payment?: Payment;
  game?: Game;
  product?: Product;
}

export type OrderStatus = "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUND_PENDING" | "REFUNDED" | "CANCELLED";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  currency: string;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  provider_name: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  transaction_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";

export interface Wallet {
  id: string;
  user_id: string;
  balance: string;
  currency: string;
  status: WalletStatus;
  created_at: string;
  updated_at: string;
}

export type WalletStatus = "ACTIVE" | "FROZEN" | "LOCKED";

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  user_id: string;
  type: WalletTransactionType;
  amount: string;
  currency: string;
  balance_before: string;
  balance_after: string;
  reference: string | null;
  description: string | null;
  status: TransactionStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type WalletTransactionType = "DEPOSIT" | "PURCHASE" | "TOPUP" | "REFUND" | "COMMISSION" | "WITHDRAWAL" | "ADJUSTMENT" | "BONUS" | "REVERSAL";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REVERSED";

export interface SellerProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zone: string | null;
  avatar_url: string | null;
  level: SellerLevel;
  status: SellerProfileStatus;
  commission_rate: string;
  created_at: string;
  updated_at: string;
}

export type SellerLevel = "STANDARD" | "PRO" | "PARTNER";
export type SellerProfileStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export interface SellerRequest {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string | null;
  zone: string | null;
  experience_months: number | null;
  reason: string | null;
  status: SellerRequestStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SellerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SellerPrice {
  id: string;
  seller_id: string;
  product_id: string;
  custom_price: string;
  margin_override: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  seller_id: string;
  order_id: string;
  amount: string;
  rate: string;
  type: CommissionType;
  status: CommissionStatus;
  created_at: string;
}

export type CommissionType = "PERCENTAGE" | "FIXED";
export type CommissionStatus = "EARNED" | "PAID" | "WITHDRAWN" | "REVERSED";

export interface Withdrawal {
  id: string;
  seller_id: string;
  amount: string;
  currency: string;
  method: string;
  reference: string | null;
  status: WithdrawalStatus;
  admin_notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type WithdrawalStatus = "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "COMPLETED" | "FAILED";

export interface Promotion {
  id: string;
  name: string;
  code: string | null;
  type: PromotionType;
  value: string;
  min_amount: string | null;
  max_uses: number | null;
  current_uses: number;
  start_date: string;
  end_date: string;
  game_ids: string[] | null;
  product_ids: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "CASHBACK" | "BONUS";

export interface Coupon {
  id: string;
  promotion_id: string;
  code: string;
  user_id: string | null;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export type NotificationType = "ORDER_SUCCESS" | "ORDER_FAILED" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SELLER_APPROVED" | "SELLER_REJECTED" | "WITHDRAWAL_COMPLETED" | "PROMOTION" | "SYSTEM_ALERT";

export interface SupportTicket {
  id: string;
  user_id: string;
  category: string;
  subject: string;
  description: string;
  order_id: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: unknown;
  label: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface SellerStats {
  total_sales: string;
  total_orders: number;
  total_commissions: string;
  total_withdrawals: string;
  current_balance: string;
  active_products: number;
  pending_withdrawals: number;
  conversion_rate: string;
}
export interface GameProduct {
  id: string;
  game_id: string;
  name: string;
  sku: string;
  provider_id: string | null;
  cost_provider: string | null;
  price_gamer: string;
  price_seller: string | null;
  price_pro_seller: string | null;
  price_partner: string | null;
  currency: string;
  status: ProductStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}
