-- ============================================
-- GAME TOP-UP HAITI - Initial Database Schema
-- ============================================
-- Run with: supabase db push or via SQL editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE user_role AS ENUM ('GAMER', 'SELLER', 'PRO_SELLER', 'PARTNER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE profile_status AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');
CREATE TYPE game_status AS ENUM ('ACTIVE', 'INACTIVE', 'SOFT_DELETED');
CREATE TYPE product_status AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
CREATE TYPE provider_health_status AS ENUM ('ONLINE', 'OFFLINE', 'DEGRADED', 'UNKNOWN');
CREATE TYPE order_status AS ENUM ('PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUND_PENDING', 'REFUNDED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'REFUNDED');
CREATE TYPE wallet_transaction_type AS ENUM ('DEPOSIT', 'PURCHASE', 'TOPUP', 'REFUND', 'COMMISSION', 'WITHDRAWAL', 'ADJUSTMENT', 'BONUS', 'REVERSAL');
CREATE TYPE transaction_status AS ENUM ('COMPLETED', 'PENDING', 'FAILED', 'REVERSED');
CREATE TYPE wallet_status AS ENUM ('ACTIVE', 'FROZEN', 'LOCKED');
CREATE TYPE seller_level AS ENUM ('STANDARD', 'PRO', 'PARTNER');
CREATE TYPE seller_profile_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
CREATE TYPE seller_request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE commission_type AS ENUM ('PERCENTAGE', 'FIXED');
CREATE TYPE commission_status AS ENUM ('EARNED', 'PAID', 'WITHDRAWN', 'REVERSED');
CREATE TYPE withdrawal_status AS ENUM ('PENDING', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED');
CREATE TYPE promotion_type AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT', 'CASHBACK', 'BONUS');
CREATE TYPE notification_type AS ENUM ('ORDER_SUCCESS', 'ORDER_FAILED', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'SELLER_APPROVED', 'SELLER_REJECTED', 'WITHDRAWAL_COMPLETED', 'PROMOTION', 'SYSTEM_ALERT');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE currency AS ENUM ('HTG', 'USD', 'DOP');

-- ============================================
-- ROLLES
-- ============================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name user_role NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  permissions JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (id, name, label, description, is_default) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001'::UUID, 'GAMER', 'Gamer', 'Utilisateur standard pouvant acheter des top-ups', true),
  ('a1b2c3d4-0002-0002-0002-000000000002'::UUID, 'SELLER', 'Vendeur', 'Vendeur vérifié pouvant revendre des top-ups', false),
  ('a1b2c3d4-0003-0003-0003-000000000003'::UUID, 'PRO_SELLER', 'Pro Vendeur', 'Vendeur professionnel avec plus de fonctionnalités', false),
  ('a1b2c3d4-0004-0004-0004-000000000004'::UUID, 'PARTNER', 'Partenaire', 'Partenaire stratégique de la plateforme', false),
  ('a1b2c3d4-0005-0005-0005-000000000005'::UUID, 'ADMIN', 'Administrateur', 'Administrateur de la plateforme', false),
  ('a1b2c3d4-0006-0006-0006-000000000006'::UUID, 'SUPER_ADMIN', 'Super Administrateur', 'Super administrateur avec tous les droits', false);

-- ============================================
-- PROFILS UTILISATEURS
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'GAMER',
  status profile_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- ============================================
-- CATEGORIES DE JEUX
-- ============================================

CREATE TABLE game_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JEUX
-- ============================================

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  category_id UUID REFERENCES game_categories(id) ON DELETE SET NULL,
  status game_status DEFAULT 'ACTIVE',
  display_order INT DEFAULT 0,
  instructions TEXT,
  required_fields JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_games_status ON games(status);
CREATE INDEX idx_games_slug ON games(slug);
CREATE INDEX idx_games_active ON games(is_active, status, display_order);

-- ============================================
-- FOURNISSEURS
-- ============================================

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  api_name TEXT,
  api_url TEXT,
  is_active BOOLEAN DEFAULT true,
  health_status provider_health_status DEFAULT 'UNKNOWN',
  balance TEXT,
  last_sync_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_providers_active ON providers(is_active);
CREATE INDEX idx_providers_health ON providers(health_status);

-- ============================================
-- PRODUITS DU FOURNISSEUR
-- ============================================

CREATE TABLE provider_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  provider_product_id TEXT,
  cost TEXT,
  currency TEXT DEFAULT 'HTG',
  is_available BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pp_provider ON provider_products(provider_id);
CREATE INDEX idx_pp_sku ON provider_products(product_sku);

-- ============================================
-- PRODUITS DU JEU (catalogue public)
-- ============================================

CREATE TABLE game_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  cost_provider TEXT,
  price_gamer TEXT NOT NULL,
  price_seller TEXT,
  price_pro_seller TEXT,
  price_partner TEXT,
  currency TEXT DEFAULT 'HTG',
  status product_status DEFAULT 'ACTIVE',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_gp_game ON game_products(game_id);
CREATE INDEX idx_gp_sku ON game_products(sku);
CREATE INDEX idx_gp_status ON game_products(status);

-- ============================================
-- COMMANDES
-- ============================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  product_id UUID REFERENCES game_products(id) ON DELETE SET NULL,
  player_id TEXT,
  server_id TEXT,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  provider_transaction_id TEXT,
  idempotency_key TEXT UNIQUE,
  payment_id UUID,
  status order_status DEFAULT 'PENDING',
  metadata JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_idempotency ON orders(idempotency_key);

-- ============================================
-- ITEMS DE COMMANDE
-- ============================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES game_products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price TEXT NOT NULL,
  total_price TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oi_order ON order_items(order_id);

-- ============================================
-- PAIEMENTS
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',
  status payment_status DEFAULT 'PENDING',
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- PORTFEUILLES
-- ============================================

CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance TEXT DEFAULT '0',
  currency TEXT DEFAULT 'HTG',
  status wallet_status DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_wallets_user ON wallets(user_id);

-- ============================================
-- TRANSACTIONS DE PORTFEUILLE (LEDGER)
-- ============================================

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type wallet_transaction_type NOT NULL,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',
  balance_before TEXT NOT NULL,
  balance_after TEXT NOT NULL,
  reference TEXT,
  description TEXT,
  status transaction_status DEFAULT 'COMPLETED',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_wt_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wt_user ON wallet_transactions(user_id);
CREATE INDEX idx_wt_type ON wallet_transactions(type);

-- ============================================
-- PROFILS VENDEURS
-- ============================================

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  business_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  zone TEXT,
  avatar_url TEXT,
  level seller_level DEFAULT 'STANDARD',
  status seller_profile_status DEFAULT 'PENDING',
  commission_rate TEXT DEFAULT '10.00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_seller_user ON seller_profiles(user_id);

-- ============================================
-- DEMANDES DE VENDEUR
-- ============================================

CREATE TABLE seller_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  zone TEXT,
  experience_months INT,
  reason TEXT,
  status seller_request_status DEFAULT 'PENDING',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sr_user ON seller_requests(user_id);
CREATE INDEX idx_sr_status ON seller_requests(status);

-- ============================================
-- PRIX VENDEUR
-- ============================================

CREATE TABLE seller_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES game_products(id) ON DELETE CASCADE,
  custom_price TEXT NOT NULL,
  margin_override TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_sp_seller_product ON seller_prices(seller_id, product_id);

-- ============================================
-- COMMISSIONS
-- ============================================

CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  rate TEXT NOT NULL,
  type commission_type DEFAULT 'PERCENTAGE',
  status commission_status DEFAULT 'EARNED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_commissions_seller ON commissions(seller_id);
CREATE INDEX idx_commissions_order ON commissions(order_id);

-- ============================================
-- RETRAITS
-- ============================================

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',
  method TEXT NOT NULL,
  reference TEXT,
  status withdrawal_status DEFAULT 'PENDING',
  admin_notes TEXT,
  processed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_seller ON withdrawals(seller_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);

-- ============================================
-- PROMOTIONS
-- ============================================

CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type promotion_type NOT NULL,
  value TEXT NOT NULL,
  min_amount TEXT,
  max_uses INT,
  current_uses INT DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  game_ids UUID[],
  product_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COUPONS
-- ============================================

CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  is_used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);

-- ============================================
-- TICKETS DE SUPPORT
-- ============================================

CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status ticket_status DEFAULT 'OPEN',
  priority ticket_priority DEFAULT 'MEDIUM',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_tickets_status ON support_tickets(status);

-- ============================================
-- LOGS D'AUDIT
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- PARAMÈTRES SYSTÈME
-- ============================================

CREATE TABLE system_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW seller_dashboard_stats AS
SELECT
  sp.user_id,
  COUNT(DISTINCT o.id) AS total_orders,
  COALESCE(SUM(o.amount::NUMERIC), 0) AS total_sales,
  COALESCE(SUM(c.amount::NUMERIC), 0) AS total_commissions,
  COALESCE(SUM(wt_withdraw.amount::NUMERIC), 0) AS total_withdrawals,
  wal.balance AS current_balance
FROM seller_profiles sp
LEFT JOIN orders o ON sp.user_id = o.user_id AND o.status = 'SUCCESS'
LEFT JOIN commissions c ON sp.user_id = c.seller_id AND c.status IN ('EARNED', 'PAID')
LEFT JOIN withdrawals wt_withdraw ON sp.user_id = wt_withdraw.seller_id
LEFT JOIN wallets wal ON sp.user_id = wal.user_id
GROUP BY sp.user_id, wal.balance;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_products_updated_at BEFORE UPDATE ON game_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_profiles_updated_at BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seller_requests_updated_at BEFORE UPDATE ON seller_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Everyone can view active profiles" ON profiles FOR SELECT USING (true);

-- Public read access for active games and products
CREATE POLICY "Anyone can view active games" ON games FOR SELECT USING (is_active = true AND status = 'ACTIVE');
CREATE POLICY "Anyone can view active products" ON game_products FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Anyone can view game categories" ON game_categories FOR SELECT;
CREATE POLICY "Anyone can view active providers" ON providers FOR SELECT USING (is_active = true);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (auth.uid() IN (SELECT user_id FROM orders WHERE id = order_id));
CREATE POLICY "Users can create order items" ON order_items FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM orders WHERE id = order_id));

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON payments FOR UPDATE USING (auth.uid() = user_id);

-- Wallets policies
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON wallets FOR UPDATE USING (auth.uid() = user_id);

-- Wallet transactions policies
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own wallet transactions" ON wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seller profiles policies
CREATE POLICY "Users can view own seller profile" ON seller_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own seller profile" ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own seller profile" ON seller_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Seller requests policies
CREATE POLICY "Users can view own seller requests" ON seller_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create seller requests" ON seller_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seller prices policies
CREATE POLICY "Sellers can view own prices" ON seller_prices FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can create own prices" ON seller_prices FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own prices" ON seller_prices FOR UPDATE USING (auth.uid() = seller_id);

-- Commissions policies
CREATE POLICY "Sellers can view own commissions" ON commissions FOR SELECT USING (auth.uid() = seller_id);

-- Withdrawals policies
CREATE POLICY "Sellers can view own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can create withdrawals" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support tickets policies
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Audit logs - admin only (via service role)
CREATE POLICY "Admin full access to audit logs" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "Admin can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update audit logs" ON audit_logs FOR UPDATE USING (true) WITH CHECK (true);

-- System settings
CREATE POLICY "Anyone can view public settings" ON system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admin can view settings" ON system_settings FOR SELECT USING (true);
CREATE POLICY "Admin can insert settings" ON system_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update settings" ON system_settings FOR UPDATE USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA (DEVELOPMENT ONLY)
-- ============================================

-- Games seed
INSERT INTO games (id, name, slug, description, status, display_order, is_active) VALUES
  ('f1a2b3c4-0001-0001-0001-000000000001'::UUID, 'Free Fire', 'free-fire', 'Jeu de battle royale ultra populaire en Africa et dans le monde.', 'ACTIVE', 1, true),
  ('f1a2b3c4-0002-0002-0002-000000000002'::UUID, 'Mobile Legends: Bang Bang', 'mobile-legends', 'Jeu MOBA compétitif avec des héros variés.', 'ACTIVE', 2, true),
  ('f1a2b3c4-0003-0003-0003-000000000003'::UUID, 'PUBG Mobile', 'pubg-mobile', 'Jeu de battle royale tactique pour mobile.', 'ACTIVE', 3, true),
  ('f1a2b3c4-0004-0004-0004-000000000004'::UUID, 'Roblox', 'roblox', 'Plateforme de jeux créés par la communauté.', 'ACTIVE', 4, true),
  ('f1a2b3c4-0005-0005-0005-000000000005'::UUID, 'FC Mobile', 'fc-mobile', 'Le jeu officiel de football EA Sports.', 'ACTIVE', 5, true),
  ('f1a2b3c4-0006-0006-0006-000000000006'::UUID, 'eFootball', 'efootball', 'Jeu de football de Konami.', 'ACTIVE', 6, true);

-- Game products seed (Free Fire)
INSERT INTO game_products (id, game_id, name, sku, cost_provider, price_gamer, price_seller, price_pro_seller, price_partner, status) VALUES
  ('f1a2b3c4-0001-0001-0001-000000000001'::UUID, 'f1a2b3c4-0001-0001-0001-000000000001'::UUID, 'Free Fire 100 Diamonds', 'FF-100', '85.00', '100.00', '95.00', '93.00', '90.00', 'ACTIVE'),
  ('f1a2b3c4-0002-0002-0002-000000000002'::UUID, 'f1a2b3c4-0001-0001-0001-000000000001'::UUID, 'Free Fire 310 Diamonds', 'FF-310', '250.00', '300.00', '285.00', '280.00', '275.00', 'ACTIVE'),
  ('f1a2b3c4-0003-0003-0003-000000000003'::UUID, 'f1a2b3c4-0001-0001-0001-000000000001'::UUID, 'Free Fire 520 Diamonds', 'FF-520', '400.00', '500.00', '475.00', '470.00', '465.00', 'ACTIVE'),
  ('f1a2b3c4-0004-0004-0004-000000000004'::UUID, 'f1a2b3c4-0001-0001-0001-000000000001'::UUID, 'Free Fire 1060 Diamonds', 'FF-1060', '800.00', '1000.00', '950.00', '940.00', '930.00', 'ACTIVE');

-- Game products seed (Mobile Legends)
INSERT INTO game_products (id, game_id, name, sku, cost_provider, price_gamer, price_seller, price_pro_seller, price_partner, status) VALUES
  ('f1a2b3c4-0005-0005-0005-000000000005'::UUID, 'f1a2b3c4-0002-0002-0002-000000000002'::UUID, 'MLBB 86 Diamond', 'ML-86', '70.00', '85.00', '80.00', '78.00', '76.00', 'ACTIVE'),
  ('f1a2b3c4-0006-0006-0006-000000000006'::UUID, 'f1a2b3c4-0002-0002-0002-000000000002'::UUID, 'MLBB 172 Diamond', 'ML-172', '135.00', '170.00', '160.00', '158.00', '155.00', 'ACTIVE'),
  ('f1a2b3c4-0007-0007-0007-000000000007'::UUID, 'f1a2b3c4-0002-0002-0002-000000000002'::UUID, 'MLBB 365 Diamond', 'ML-365', '280.00', '350.00', '330.00', '325.00', '320.00', 'ACTIVE');

-- Game products seed (PUBG Mobile)
INSERT INTO game_products (id, game_id, name, sku, cost_provider, price_gamer, price_seller, price_pro_seller, price_partner, status) VALUES
  ('f1a2b3c4-0008-0008-0008-000000000008'::UUID, 'f1a2b3c4-0003-0003-0003-000000000003'::UUID, 'PUBG 60 UC', 'PUBG-60', '55.00', '70.00', '65.00', '63.00', '62.00', 'ACTIVE'),
  ('f1a2b3c4-0009-0009-0009-000000000009'::UUID, 'f1a2b3c4-0003-0003-0003-000000000003'::UUID, 'PUBG 325 UC', 'PUBG-325', '280.00', '350.00', '330.00', '325.00', '320.00', 'ACTIVE'),
  ('f1a2b3c4-0010-0010-0010-000000000010'::UUID, 'f1a2b3c4-0003-0003-0003-000000000003'::UUID, 'PUBG 660 UC', 'PUBG-660', '550.00', '680.00', '645.00', '640.00', '635.00', 'ACTIVE');

-- Game products seed (Roblox)
INSERT INTO game_products (id, game_id, name, sku, cost_provider, price_gamer, price_seller, price_pro_seller, price_partner, status) VALUES
  ('f1a2b3c4-0011-0011-0011-000000000011'::UUID, 'f1a2b3c4-0004-0004-0004-000000000004'::UUID, 'Roblox 450 Robux', 'RBX-450', '4.50', '5.00', '4.75', '4.70', '4.65', 'ACTIVE'),
  ('f1a2b3c4-0012-0012-0012-000000000012'::UUID, 'f1a2b3c4-0004-0004-0004-000000000004'::UUID, 'Roblox 1000 Robux', 'RBX-1000', '9.50', '10.50', '10.00', '9.90', '9.80', 'ACTIVE'),
  ('f1a2b3c4-0013-0013-0013-000000000013'::UUID, 'f1a2b3c4-0004-0004-0004-000000000004'::UUID, 'Roblox 2200 Robux', 'RBX-2200', '20.00', '22.00', '21.00', '20.80', '20.50', 'ACTIVE');

-- Game products seed (FC Mobile)
INSERT INTO game_products (id, game_id, name, sku, cost_provider, price_gamer, price_seller, price_pro_seller, price_partner, status) VALUES
  ('f1a2b3c4-0014-0014-0014-000000000014'::UUID, 'f1a2b3c4-0005-0005-0005-000000000005'::UUID, 'FC 600 Coins', 'FC-600', '100.00', '125.00', '118.00', '116.00', '114.00', 'ACTIVE'),
  ('f1a2b3c4-0015-0015-0015-000000000015'::UUID, 'f1a2b3c4-0005-0005-0005-000000000005'::UUID, 'FC 1500 Coins', 'FC-1500', '240.00', '300.00', '285.00', '280.00', '275.00', 'ACTIVE');

-- Game products seed (eFootball)
INSERT INTO game_products (id, game_id, name, sku, cost_provider, price_gamer, price_seller, price_pro_seller, price_partner, status) VALUES
  ('f1a2b3c4-0016-0016-0016-000000000016'::UUID, 'f1a2b3c4-0006-0006-0006-000000000006'::UUID, 'eFootball 200 Coins', 'EF-200', '35.00', '50.00', '47.00', '46.00', '45.00', 'ACTIVE'),
  ('f1a2b3c4-0017-0017-0017-000000000017'::UUID, 'f1a2b3c4-0006-0006-0006-000000000006'::UUID, 'eFootball 1200 Coins', 'EF-1200', '200.00', '250.00', '237.00', '235.00', '232.00', 'ACTIVE');

-- Default system settings
INSERT INTO system_settings (id, key, value, label, description, is_public) VALUES
  ('s1', 'platform_name', '"TOPUP+"', 'Nom de la plateforme', 'Nom affiché dans l''application', true),
  ('s2', 'default_currency', '"HTG"', 'Devise par défaut', 'Devise utilisée par défaut', true),
  ('s3', 'platform_url', '"http://localhost:3000"', 'URL de la plateforme', 'URL de base de l''application', true),
  ('s4', 'seller_commission_rate', '10.00', 'Taux de commission vendeur', 'Pourcentage de commission sur les ventes', false),
  ('s5', 'min_withdrawal_amount', '500.00', 'Montant minimum de retrait', 'Montant minimum pour demander un retrait', false),
  ('s6', 'min_deposit_amount', '100.00', 'Montant minimum de dépôt', 'Montant minimum pour déposer', false),
  ('s7', 'maintenance_mode', 'false', 'Mode maintenance', 'Active ou désactive le mode maintenance', false),
  ('s8', 'enable_registration', 'true', 'Inscription activée', 'Permet aux nouveaux utilisateurs de s''inscrire', true),
  ('s9', 'enable_seller_registration', 'true', 'Inscription vendeur activée', 'Permet aux gamers de devenir vendeurs', true),
  ('s10', 'payment_fee_rate', '2.5', 'Taux de frais de paiement', 'Pourcentage de frais sur les paiements', false);