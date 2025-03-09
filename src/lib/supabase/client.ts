import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  title: string;
  price: number;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CartItemInsert = Omit<CartItem, 'id' | 'created_at' | 'updated_at'>; 