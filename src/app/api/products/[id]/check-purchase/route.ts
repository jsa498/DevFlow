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
    // Create a Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Get the session token from the cookie
    const token = request.cookies.get('sb-access-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { purchased: false },
        { status: 401 }
      );
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { purchased: false },
        { status: 401 }
      );
    }

    const id = params.id;

    // Check if user has purchased the product
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
      throw error;
    }

    return NextResponse.json({ purchased: !!purchase });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking purchase status' },
      { status: 500 }
    );
  }
} 