/*
  # ZARIEL & Co Influencer App Database Schema

  ## Overview
  Complete database schema for the subscription-based creator marketplace with token economy.

  ## 1. New Tables

  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `full_name` (text)
  - `role` (text, not null) - 'creator' or 'company'
  - `avatar_url` (text)
  - `bio` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `subscriptions`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `plan_type` (text) - 'monthly' or 'yearly'
  - `status` (text) - 'active', 'cancelled', 'expired'
  - `current_period_start` (timestamptz)
  - `current_period_end` (timestamptz)
  - `videos_uploaded_this_period` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `videos`
  - `id` (uuid, primary key)
  - `creator_id` (uuid, references profiles)
  - `title` (text, not null)
  - `description` (text)
  - `video_url` (text, not null)
  - `thumbnail_url` (text)
  - `duration` (integer) - in seconds
  - `status` (text, default 'active') - 'active', 'sold', 'archived'
  - `price_tokens` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `token_wallets`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles, unique)
  - `balance` (integer, default 0)
  - `total_earned` (integer, default 0)
  - `total_spent` (integer, default 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `token_transactions`
  - `id` (uuid, primary key)
  - `from_user_id` (uuid, references profiles)
  - `to_user_id` (uuid, references profiles)
  - `amount` (integer, not null)
  - `transaction_type` (text, not null) - 'purchase', 'redemption', 'issuance', 'ecosystem_purchase'
  - `reference_id` (uuid) - references videos or purchases
  - `description` (text)
  - `status` (text, default 'completed') - 'pending', 'completed', 'failed'
  - `created_at` (timestamptz)

  ### `purchases`
  - `id` (uuid, primary key)
  - `video_id` (uuid, references videos)
  - `creator_id` (uuid, references profiles)
  - `company_id` (uuid, references profiles)
  - `tokens_paid` (integer, not null)
  - `status` (text, default 'completed') - 'pending', 'completed', 'refunded'
  - `notes` (text)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Policies for authenticated users based on role
  - Creators can only access their own content
  - Company can view all videos and make purchases
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL CHECK (role IN ('creator', 'company')),
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  plan_type text NOT NULL CHECK (plan_type IN ('monthly', 'yearly')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  videos_uploaded_this_period integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'archived')),
  price_tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own videos"
  ON videos FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Company can view all videos"
  ON videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'company'
    )
  );

CREATE POLICY "Creators can insert own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- Token wallets table
CREATE TABLE IF NOT EXISTS token_wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES profiles ON DELETE CASCADE,
  balance integer DEFAULT 0,
  total_earned integer DEFAULT 0,
  total_spent integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE token_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallet"
  ON token_wallets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON token_wallets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON token_wallets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Token transactions table
CREATE TABLE IF NOT EXISTS token_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles ON DELETE SET NULL,
  to_user_id uuid REFERENCES profiles ON DELETE SET NULL,
  amount integer NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('purchase', 'redemption', 'issuance', 'ecosystem_purchase')),
  reference_id uuid,
  description text,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON token_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert transactions"
  ON token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos ON DELETE CASCADE,
  creator_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES profiles ON DELETE CASCADE,
  tokens_paid integer NOT NULL,
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own sales"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

CREATE POLICY "Company can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = company_id);

CREATE POLICY "Company can insert purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = company_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_videos_creator_id ON videos(creator_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_from_user ON token_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_to_user ON token_transactions(to_user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_creator_id ON purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_purchases_company_id ON purchases(company_id);
CREATE INDEX IF NOT EXISTS idx_purchases_video_id ON purchases(video_id);
