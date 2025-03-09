import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

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
    const id = params.id;
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get product from Supabase
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the product' },
      { status: 500 }
    );
  }
} 