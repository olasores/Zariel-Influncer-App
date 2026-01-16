import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'creator' | 'company';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentType = 'video' | 'image' | 'audio' | 'document' | 'other';

export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  videos_uploaded_this_period: number;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  content_url: string;
  content_type: ContentType;
  thumbnail_url: string | null;
  duration: number | null;
  file_size: number | null;
  file_extension: string | null;
  status: 'active' | 'sold' | 'archived';
  price_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface Video extends Content {
  video_url: string;
}

export interface TokenWallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface TokenTransaction {
  id: string;
  from_user_id: string | null;
  to_user_id: string | null;
  amount: number;
  transaction_type: 'purchase' | 'redemption' | 'issuance' | 'ecosystem_purchase';
  reference_id: string | null;
  description: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Purchase {
  id: string;
  video_id: string;
  creator_id: string;
  company_id: string;
  tokens_paid: number;
  status: 'pending' | 'completed' | 'refunded';
  notes: string | null;
  created_at: string;
}
