-- ==============================================================================
-- FinTrack Pro - Database Schema Migration
-- Standard: Industry-Grade Immutable Ledger Pattern, Multi-tenant RLS, Fast Views
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  base_currency VARCHAR(3) DEFAULT 'IDR' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Wallets / Accounts Table
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) CHECK (type IN ('bank', 'ewallet', 'cash', 'investment', 'credit')) NOT NULL,
  initial_balance NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
  color VARCHAR(20) DEFAULT '#6366F1',
  is_archived BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE, -- NULL = System default
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(30) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL
);

-- 4. Transactions Table (Immutable-focused with Soft Delete)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  wallet_id UUID REFERENCES public.wallets ON DELETE RESTRICT NOT NULL,
  destination_wallet_id UUID REFERENCES public.wallets ON DELETE RESTRICT, -- Jika type = 'transfer'
  category_id UUID REFERENCES public.categories ON DELETE SET NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  deleted_at TIMESTAMPTZ, -- Soft delete flag for auditability
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
  ON public.transactions(user_id, transaction_date DESC) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_transactions_wallet 
  ON public.transactions(wallet_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_wallets_user 
  ON public.wallets(user_id) 
  WHERE is_archived = FALSE;

-- 5. Database View for Fast Performance Aggregations
CREATE OR REPLACE VIEW public.vw_user_monthly_summary AS
SELECT
  user_id,
  DATE_TRUNC('month', transaction_date) AS month_year,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net_cashflow
FROM public.transactions
WHERE deleted_at IS NULL AND type != 'transfer'
GROUP BY user_id, DATE_TRUNC('month', transaction_date);

-- 6. Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can only access their own profiles" ON public.profiles;
CREATE POLICY "Users can only access their own profiles"
  ON public.profiles FOR ALL USING (auth.uid() = id);

-- Wallets Policies
DROP POLICY IF EXISTS "Users can manage their own wallets" ON public.wallets;
CREATE POLICY "Users can manage their own wallets"
  ON public.wallets FOR ALL USING (auth.uid() = user_id);

-- Categories Policies
DROP POLICY IF EXISTS "Users can view default categories or own" ON public.categories;
CREATE POLICY "Users can view default categories or own"
  ON public.categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own categories" ON public.categories;
CREATE POLICY "Users can manage their own categories"
  ON public.categories FOR ALL USING (auth.uid() = user_id);

-- Transactions Policies
DROP POLICY IF EXISTS "Users can manage their own transactions" ON public.transactions;
CREATE POLICY "Users can manage their own transactions"
  ON public.transactions FOR ALL USING (auth.uid() = user_id);

-- Trigger: Automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, base_currency)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Pengguna FinTrack'), 'IDR');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

