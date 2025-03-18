import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = params;
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Get product details
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        courses (*)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
} 