-- ============================================
-- GAME TOP-UP HAITI - Migration 004
-- GAME ACCOUNTS MARKETPLACE + WALLET DEPOSITS
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE account_type AS ENUM ('SALE', 'RENTAL');
CREATE TYPE account_status AS ENUM ('PENDING_REVIEW', 'ACTIVE', 'SOLD', 'RENTED', 'REJECTED', 'WITHDRAWN');
CREATE TYPE rental_status AS ENUM ('ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED');
CREATE TYPE deposit_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED');
CREATE TYPE escrow_status AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED');

-- ============================================
-- 2. GAME ACCOUNTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS game_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,

  -- Listing info
  title TEXT NOT NULL,
  description TEXT,
  type account_type NOT NULL DEFAULT 'SALE',
  status account_status DEFAULT 'PENDING_REVIEW',

  -- Account details (public)
  rank TEXT,
  level INT,
  server TEXT,
  skins_count INT DEFAULT 0,
  heroes_count INT DEFAULT 0,
  highlights JSONB,   -- e.g. ["Diamond Rank", "Rare Skin X", "1200+ Hours"]

  -- Pricing
  price TEXT NOT NULL,
  rental_price_per_day TEXT,     -- Only for RENTAL type
  min_rental_days INT DEFAULT 1, -- Minimum rental period
  currency TEXT DEFAULT 'HTG',

  -- Screenshots (array of URLs)
  screenshot_urls TEXT[],

  -- Credentials (PRIVATE — Admin only sees this after purchase)
  credentials JSONB,

  -- Admin fields
  admin_notes TEXT,
  verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  commission_rate TEXT DEFAULT '10.00',  -- Platform commission %

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ga_seller ON game_accounts(seller_id);
CREATE INDEX IF NOT EXISTS idx_ga_game ON game_accounts(game_id);
CREATE INDEX IF NOT EXISTS idx_ga_status ON game_accounts(status);
CREATE INDEX IF NOT EXISTS idx_ga_type ON game_accounts(type);

CREATE TRIGGER update_game_accounts_updated_at
  BEFORE UPDATE ON game_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. ACCOUNT RENTALS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS account_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES game_accounts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  days INT NOT NULL,
  daily_price TEXT NOT NULL,
  total_price TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',

  status rental_status DEFAULT 'ACTIVE',
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rentals_account ON account_rentals(account_id);
CREATE INDEX IF NOT EXISTS idx_rentals_buyer ON account_rentals(buyer_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON account_rentals(status);

CREATE TRIGGER update_account_rentals_updated_at
  BEFORE UPDATE ON account_rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. WALLET DEPOSITS TABLE (Manual MonCash)
-- ============================================

CREATE TABLE IF NOT EXISTS wallet_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  amount TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',

  -- MonCash info
  moncash_phone TEXT NOT NULL,
  moncash_reference TEXT,      -- Transaction reference from user
  payment_proof_url TEXT,      -- Screenshot of payment

  status deposit_status DEFAULT 'PENDING',

  -- Admin handling
  admin_notes TEXT,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deposits_user ON wallet_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON wallet_deposits(status);

CREATE TRIGGER update_wallet_deposits_updated_at
  BEFORE UPDATE ON wallet_deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ESCROW TABLE (For marketplace transactions)
-- ============================================

CREATE TABLE IF NOT EXISTS escrow_holds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reference to what is being purchased
  account_id UUID REFERENCES game_accounts(id) ON DELETE SET NULL,
  rental_id UUID REFERENCES account_rentals(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,

  amount TEXT NOT NULL,         -- Total amount held
  platform_fee TEXT NOT NULL,   -- Platform commission
  seller_amount TEXT NOT NULL,  -- Amount to release to seller
  currency TEXT DEFAULT 'HTG',

  status escrow_status DEFAULT 'HELD',

  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  released_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_escrow_buyer ON escrow_holds(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_seller ON escrow_holds(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrow_status ON escrow_holds(status);

CREATE TRIGGER update_escrow_holds_updated_at
  BEFORE UPDATE ON escrow_holds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. REVIEWS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id UUID REFERENCES game_accounts(id) ON DELETE SET NULL,
  escrow_id UUID REFERENCES escrow_holds(id) ON DELETE SET NULL,

  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_seller ON reviews(seller_id);

-- ============================================
-- 7. ADD WALLET TRANSACTION TYPES
-- ============================================

ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'ESCROW_HOLD';
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'ESCROW_RELEASE';
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'DEPOSIT';

-- ============================================
-- 8. RLS POLICIES
-- ============================================

-- Game Accounts
ALTER TABLE game_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active game accounts"
  ON game_accounts FOR SELECT
  USING (status = 'ACTIVE');

CREATE POLICY "Sellers can view own accounts"
  ON game_accounts FOR SELECT
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create game accounts"
  ON game_accounts FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own pending accounts"
  ON game_accounts FOR UPDATE
  USING (auth.uid() = seller_id AND status = 'PENDING_REVIEW');

CREATE POLICY "Admin can view all game accounts"
  ON game_accounts FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update any game account"
  ON game_accounts FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Account Rentals
ALTER TABLE account_rentals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rentals"
  ON account_rentals FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create rentals"
  ON account_rentals FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admin can view all rentals"
  ON account_rentals FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Wallet Deposits
ALTER TABLE wallet_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deposits"
  ON wallet_deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deposits"
  ON wallet_deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all deposits"
  ON wallet_deposits FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update deposits"
  ON wallet_deposits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Escrow
ALTER TABLE escrow_holds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own escrows"
  ON escrow_holds FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create escrows"
  ON escrow_holds FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Admin can view all escrows"
  ON escrow_holds FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admin can update escrows"
  ON escrow_holds FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);
