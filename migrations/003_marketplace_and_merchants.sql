-- ============================================
-- GAME TOP-UP HAITI - Migration 003
-- MARKETPLACE & MERCHANT NETWORK
-- ============================================

-- 1. ADD NEW WALLET TRANSACTION TYPE
ALTER TYPE wallet_transaction_type ADD VALUE IF NOT EXISTS 'P2P_TRANSFER';

-- 2. CREATE MARKETPLACE ENUMS
CREATE TYPE listing_type AS ENUM ('ACCOUNT', 'CURRENCY', 'ITEM');
CREATE TYPE listing_status AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SOLD', 'CANCELLED', 'REJECTED');

-- 3. CREATE MARKETPLACE LISTINGS TABLE
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type listing_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price TEXT NOT NULL,
  currency TEXT DEFAULT 'HTG',
  credentials JSONB, -- Will store username/password securely. Admin sees this.
  status listing_status DEFAULT 'PENDING_APPROVAL',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_game ON marketplace_listings(game_id);

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at 
  BEFORE UPDATE ON marketplace_listings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 4. MARKETPLACE RLS POLICIES
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active listings" 
  ON marketplace_listings FOR SELECT 
  USING (status = 'ACTIVE');

CREATE POLICY "Sellers can view own listings" 
  ON marketplace_listings FOR SELECT 
  USING (auth.uid() = seller_id);

CREATE POLICY "Admin can view all listings" 
  ON marketplace_listings FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

CREATE POLICY "Sellers can create listings" 
  ON marketplace_listings FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own pending listings" 
  ON marketplace_listings FOR UPDATE 
  USING (auth.uid() = seller_id AND status = 'PENDING_APPROVAL');

CREATE POLICY "Admin can update any listing" 
  ON marketplace_listings FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- 5. UPDATE ORDERS TABLE
-- Add payment method, merchant reference, and link to marketplace listing
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'WALLET';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS merchant_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL;
