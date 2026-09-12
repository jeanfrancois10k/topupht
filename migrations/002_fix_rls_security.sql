-- ============================================
-- GAME TOP-UP HAITI - Migration 002
-- FIX RLS SECURITY & RECURSION VULNERABILITIES
-- ============================================

-- 1. SECURITY DEFINER HELPER (Prevents infinite recursion in RLS policies)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role IN ('ADMIN', 'SUPER_ADMIN')
  );
$$;

-- 2. PROFILES SECURITY
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Everyone can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Public can view active sellers" ON profiles;

-- Non-recursive policy for viewing profiles
CREATE POLICY "Users and admins can view profiles" 
  ON profiles FOR SELECT 
  USING (
    id = auth.uid() 
    OR public.is_admin(auth.uid()) 
    OR (status = 'ACTIVE' AND role IN ('SELLER', 'PRO_SELLER'))
  );

-- Non-recursive policy for updating profiles
CREATE POLICY "Users and admins can update profiles" 
  ON profiles FOR UPDATE 
  USING (
    id = auth.uid() 
    OR public.is_admin(auth.uid())
  );

-- 3. WALLET SECURITY
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
DROP POLICY IF EXISTS "Admin can update wallets" ON wallets;

CREATE POLICY "Admin can update wallets" 
  ON wallets FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- 4. WALLET TRANSACTIONS SECURITY
DROP POLICY IF EXISTS "Users can create own wallet transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Admin can insert wallet transactions" ON wallet_transactions;

CREATE POLICY "Admin can insert wallet transactions" 
  ON wallet_transactions FOR INSERT 
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. SYSTEM SETTINGS SECURITY
DROP POLICY IF EXISTS "Anyone can view public settings" ON system_settings;
CREATE POLICY "Anyone can view public settings" ON system_settings FOR SELECT USING (is_public = true);
