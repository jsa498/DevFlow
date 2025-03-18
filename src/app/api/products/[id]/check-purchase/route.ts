import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = await params.id;
    
    // Create a Supabase client using auth helpers
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('No session found:', sessionError);
      return NextResponse.json(
        { purchased: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = session.user;
    
    if (!user) {
      console.log('No user found in session');
      return NextResponse.json(
        { purchased: false, message: 'No user found in session' },
        { status: 401 }
      );
    }

    console.log(`Checking purchase status for user ${user.id} and product ${productId}`);

    // Check if user has purchased the product
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        id, 
        status, 
        created_at, 
        stripe_session_id,
        product:products (
          id,
          title,
          pdf_url,
          course:courses (
            id,
            difficulty_level,
            estimated_duration
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .eq('status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
      console.error('Error checking purchase status:', error);
      throw error;
    }

    const purchased = !!purchase;
    console.log(`Final purchase status for user ${user.id} and product ${productId}: ${purchased ? 'Purchased' : 'Not purchased'}`);
    
    return NextResponse.json({
      purchased,
      purchase: purchase || null,
    });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return NextResponse.json(
      { purchased: false, error: 'Error checking purchase status' },
      { status: 500 }
    );
  }
}
