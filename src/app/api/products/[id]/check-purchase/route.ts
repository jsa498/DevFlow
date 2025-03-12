import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

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
    // Create a Supabase client using auth helpers
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
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

    const id = params.id;

    console.log(`Checking purchase status for user ${user.id} and product ${id}`);

    // Check if user has purchased the product
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select('id, status, created_at, stripe_session_id')
      .eq('user_id', user.id)
      .eq('product_id', id)
      .eq('status', 'completed')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for "no rows returned"
      console.error('Error checking purchase status:', error);
      throw error;
    }

    // If no completed purchase found, check for pending purchases
    if (!purchase) {
      console.log(`No completed purchase found for user ${user.id} and product ${id}, checking for pending purchases`);
      
      const { data: pendingPurchase, error: pendingError } = await supabase
        .from('purchases')
        .select('id, status, created_at, stripe_session_id')
        .eq('user_id', user.id)
        .eq('product_id', id)
        .eq('status', 'pending')
        .single();
        
      if (pendingError && pendingError.code !== 'PGRST116') {
        console.error('Error checking pending purchase status:', pendingError);
      } else if (pendingPurchase) {
        console.log(`Found pending purchase for user ${user.id} and product ${id}:`, pendingPurchase);
        
        // Check if the pending purchase is older than 5 minutes
        const purchaseDate = new Date(pendingPurchase.created_at);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        if (purchaseDate < fiveMinutesAgo && pendingPurchase.stripe_session_id) {
          console.log(`Pending purchase is older than 5 minutes, updating to completed`);
          
          // Update the purchase to completed
          const { error: updateError } = await supabase
            .from('purchases')
            .update({ status: 'completed' })
            .eq('id', pendingPurchase.id);
            
          if (updateError) {
            console.error('Error updating purchase status:', updateError);
          } else {
            console.log(`Successfully updated purchase ${pendingPurchase.id} to completed`);
            return NextResponse.json({ 
              purchased: true, 
              message: 'Pending purchase was updated to completed',
              purchase: { ...pendingPurchase, status: 'completed' }
            });
          }
        }
      }
      
      // Check for any purchases regardless of status
      const { data: allPurchases, error: allError } = await supabase
        .from('purchases')
        .select('id, status, created_at, stripe_session_id')
        .eq('user_id', user.id)
        .eq('product_id', id);
        
      if (allError) {
        console.error('Error checking all purchases:', allError);
      } else if (allPurchases && allPurchases.length > 0) {
        console.log(`Found ${allPurchases.length} purchases with various statuses:`, 
          allPurchases.map(p => `${p.id}: ${p.status}`).join(', '));
      } else {
        console.log(`No purchases found at all for user ${user.id} and product ${id}`);
      }
    }

    const purchased = !!purchase;
    console.log(`Final purchase status for user ${user.id} and product ${id}: ${purchased ? 'Purchased' : 'Not purchased'}`);
    if (purchased) {
      console.log(`Purchase details:`, purchase);
    }

    return NextResponse.json({ 
      purchased, 
      message: purchased ? 'Product has been purchased' : 'Product has not been purchased',
      purchase: purchase || null
    });
  } catch (error) {
    console.error('Error checking purchase status:', error);
    return NextResponse.json(
      { error: 'An error occurred while checking purchase status', purchased: false },
      { status: 500 }
    );
  }
} 