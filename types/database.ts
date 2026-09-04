export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          status: ProfileStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          status?: ProfileStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: UserRole;
          label: string;
          description: string | null;
          permissions: Json | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: UserRole;
          label: string;
          description?: string | null;
          permissions?: Json | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: UserRole;
          label?: string;
          description?: string | null;
          permissions?: Json | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      games: {
        Row: {
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
          required_fields: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          category_id?: string | null;
          status?: GameStatus;
          display_order?: number;
          instructions?: string | null;
          required_fields?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          category_id?: string | null;
          status?: GameStatus;
          display_order?: number;
          instructions?: string | null;
          required_fields?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      game_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          description?: string | null;
          created_at?: string;
        };
      };
      game_products: {
        Row: {
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
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          game_id: string;
          name: string;
          sku: string;
          provider_id?: string | null;
          cost_provider?: string | null;
          price_gamer: string;
          price_seller?: string | null;
          price_pro_seller?: string | null;
          price_partner?: string | null;
          currency?: string;
          status?: ProductStatus;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          game_id?: string;
          name?: string;
          sku?: string;
          provider_id?: string | null;
          cost_provider?: string | null;
          price_gamer?: string;
          price_seller?: string | null;
          price_pro_seller?: string | null;
          price_partner?: string | null;
          currency?: string;
          status?: ProductStatus;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      providers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          api_name: string | null;
          api_url: string | null;
          is_active: boolean;
          health_status: ProviderHealthStatus;
          balance: string | null;
          last_sync_at: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          api_name?: string | null;
          api_url?: string | null;
          is_active?: boolean;
          health_status?: ProviderHealthStatus;
          balance?: string | null;
          last_sync_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          api_name?: string | null;
          api_url?: string | null;
          is_active?: boolean;
          health_status?: ProviderHealthStatus;
          balance?: string | null;
          last_sync_at?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      provider_products: {
        Row: {
          id: string;
          provider_id: string;
          product_sku: string;
          product_name: string;
          provider_product_id: string | null;
          cost: string;
          currency: string;
          is_available: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          provider_id: string;
          product_sku: string;
          product_name: string;
          provider_product_id?: string | null;
          cost: string;
          currency?: string;
          is_available?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          provider_id?: string;
          product_sku?: string;
          product_name?: string;
          provider_product_id?: string | null;
          cost?: string;
          currency?: string;
          is_available?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      orders: {
        Row: {
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
          metadata: Json | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          user_id: string;
          game_id?: string | null;
          product_id?: string | null;
          player_id?: string | null;
          server_id?: string | null;
          amount: string;
          currency?: string;
          provider_id?: string | null;
          provider_transaction_id?: string | null;
          idempotency_key?: string | null;
          payment_id?: string | null;
          status?: OrderStatus;
          metadata?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string;
          game_id?: string | null;
          product_id?: string | null;
          player_id?: string | null;
          server_id?: string | null;
          amount?: string;
          currency?: string;
          provider_id?: string | null;
          provider_transaction_id?: string | null;
          idempotency_key?: string | null;
          payment_id?: string | null;
          status?: OrderStatus;
          metadata?: Json | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: string;
          total_price: string;
          currency: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity?: number;
          unit_price: string;
          total_price: string;
          currency?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: string;
          total_price?: string;
          currency?: string;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          user_id: string;
          provider_name: string;
          amount: string;
          currency: string;
          status: PaymentStatus;
          transaction_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          user_id: string;
          provider_name: string;
          amount: string;
          currency?: string;
          status?: PaymentStatus;
          transaction_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          user_id?: string;
          provider_name?: string;
          amount?: string;
          currency?: string;
          status?: PaymentStatus;
          transaction_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance: string;
          currency: string;
          status: WalletStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance?: string;
          currency?: string;
          status?: WalletStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          balance?: string;
          currency?: string;
          status?: WalletStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallet_transactions: {
        Row: {
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
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          user_id: string;
          type: WalletTransactionType;
          amount: string;
          currency?: string;
          balance_before: string;
          balance_after: string;
          reference?: string | null;
          description?: string | null;
          status?: TransactionStatus;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          user_id?: string;
          type?: WalletTransactionType;
          amount?: string;
          currency?: string;
          balance_before?: string;
          balance_after?: string;
          reference?: string | null;
          description?: string | null;
          status?: TransactionStatus;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      seller_profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          zone?: string | null;
          avatar_url?: string | null;
          level?: SellerLevel;
          status?: SellerProfileStatus;
          commission_rate?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          zone?: string | null;
          avatar_url?: string | null;
          level?: SellerLevel;
          status?: SellerProfileStatus;
          commission_rate?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      seller_requests: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          city?: string | null;
          zone?: string | null;
          experience_months?: number | null;
          reason?: string | null;
          status?: SellerRequestStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          phone?: string;
          city?: string | null;
          zone?: string | null;
          experience_months?: number | null;
          reason?: string | null;
          status?: SellerRequestStatus;
          admin_notes?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      seller_prices: {
        Row: {
          id: string;
          seller_id: string;
          product_id: string;
          custom_price: string;
          margin_override: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          product_id: string;
          custom_price: string;
          margin_override?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          product_id?: string;
          custom_price?: string;
          margin_override?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      commissions: {
        Row: {
          id: string;
          seller_id: string;
          order_id: string;
          amount: string;
          rate: string;
          type: CommissionType;
          status: CommissionStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          seller_id: string;
          order_id: string;
          amount: string;
          rate: string;
          type?: CommissionType;
          status?: CommissionStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          order_id?: string;
          amount?: string;
          rate?: string;
          type?: CommissionType;
          status?: CommissionStatus;
          created_at?: string;
        };
      };
      withdrawals: {
        Row: {
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
        };
        Insert: {
          id?: string;
          seller_id: string;
          amount: string;
          currency?: string;
          method: string;
          reference?: string | null;
          status?: WithdrawalStatus;
          admin_notes?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          seller_id?: string;
          amount?: string;
          currency?: string;
          method?: string;
          reference?: string | null;
          status?: WithdrawalStatus;
          admin_notes?: string | null;
          processed_by?: string | null;
          processed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      promotions: {
        Row: {
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
          game_ids: Json | null;
          product_ids: Json | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code?: string | null;
          type?: PromotionType;
          value: string;
          min_amount?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          start_date: string;
          end_date: string;
          game_ids?: Json | null;
          product_ids?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string | null;
          type?: PromotionType;
          value?: string;
          min_amount?: string | null;
          max_uses?: number | null;
          current_uses?: number;
          start_date?: string;
          end_date?: string;
          game_ids?: Json | null;
          product_ids?: Json | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          promotion_id: string;
          code: string;
          user_id: string | null;
          is_used: boolean;
          used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          promotion_id: string;
          code: string;
          user_id?: string | null;
          is_used?: boolean;
          used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          promotion_id?: string;
          code?: string;
          user_id?: string | null;
          is_used?: boolean;
          used_at?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read: boolean;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          title: string;
          message: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          title?: string;
          message?: string;
          is_read?: boolean;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      support_tickets: {
        Row: {
          id: string;
          user_id: string;
          category: string;
          subject: string;
          description: string;
          order_id: string | null;
          status: TicketStatus;
          priority: TicketPriority;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: string;
          subject: string;
          description: string;
          order_id?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: string;
          subject?: string;
          description?: string;
          order_id?: string | null;
          status?: TicketStatus;
          priority?: TicketPriority;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          label: string;
          description: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          label: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          label?: string;
          description?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      profile_status: ProfileStatus;
      game_status: GameStatus;
      product_status: ProductStatus;
      provider_health_status: ProviderHealthStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      wallet_transaction_type: WalletTransactionType;
      transaction_status: TransactionStatus;
      wallet_status: WalletStatus;
      seller_level: SellerLevel;
      seller_profile_status: SellerProfileStatus;
      seller_request_status: SellerRequestStatus;
      commission_type: CommissionType;
      commission_status: CommissionStatus;
      withdrawal_status: WithdrawalStatus;
      promotion_type: PromotionType;
      notification_type: NotificationType;
      ticket_status: TicketStatus;
      ticket_priority: TicketPriority;
      currency: Currency;
    };
  };
};

export type UserRole = "GAMER" | "SELLER" | "PRO_SELLER" | "PARTNER" | "ADMIN" | "SUPER_ADMIN";
export type ProfileStatus = "ACTIVE" | "SUSPENDED" | "DELETED";
export type GameStatus = "ACTIVE" | "INACTIVE" | "SOFT_DELETED";
export type ProductStatus = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
export type ProviderHealthStatus = "ONLINE" | "OFFLINE" | "DEGRADED" | "UNKNOWN";
export type OrderStatus = "PENDING" | "PAYMENT_PENDING" | "PAID" | "PROCESSING" | "SUCCESS" | "FAILED" | "REFUND_PENDING" | "REFUNDED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
export type WalletTransactionType = "DEPOSIT" | "PURCHASE" | "TOPUP" | "REFUND" | "COMMISSION" | "WITHDRAWAL" | "ADJUSTMENT" | "BONUS" | "REVERSAL";
export type TransactionStatus = "COMPLETED" | "PENDING" | "FAILED" | "REVERSED";
export type WalletStatus = "ACTIVE" | "FROZEN" | "LOCKED";
export type SellerLevel = "STANDARD" | "PRO" | "PARTNER";
export type SellerProfileStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
export type SellerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type CommissionType = "PERCENTAGE" | "FIXED";
export type CommissionStatus = "EARNED" | "PAID" | "WITHDRAWN" | "REVERSED";
export type WithdrawalStatus = "PENDING" | "PROCESSING" | "APPROVED" | "REJECTED" | "COMPLETED" | "FAILED";
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT" | "CASHBACK" | "BONUS";
export type NotificationType = "ORDER_SUCCESS" | "ORDER_FAILED" | "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "SELLER_APPROVED" | "SELLER_REJECTED" | "WITHDRAWAL_COMPLETED" | "PROMOTION" | "SYSTEM_ALERT";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type Currency = "HTG" | "USD" | "DOP";