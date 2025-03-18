import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import Stripe from 'stripe';

// Disable body parsing, we need the raw body
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  // Initialize Stripe
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-02-24.acacia',
  });

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('Processing completed checkout session:', session.id);
    
    try {
      // Create Supabase client with service role key for admin access
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      // Get the user ID and product IDs from the session metadata
      const userId = session.metadata?.user_id;
      const productIds = session.metadata?.product_ids?.split(',');
      
      if (!userId || !productIds || productIds.length === 0) {
        console.error('Missing user ID or product IDs in session metadata:', session.id);
        return new NextResponse('Missing user ID or product IDs in session metadata', { status: 400 });
      }
      
      console.log(`Processing purchase for user: ${userId}, products: ${productIds.join(', ')}`);
      
      // First, get all pending purchases for this session
      const { data: pendingPurchases, error: pendingError } = await supabase
        .from('purchases')
        .select('id, product_id')
        .eq('user_id', userId)
        .eq('stripe_session_id', session.id)
        .eq('status', 'pending');

      if (pendingError) {
        console.error('Error fetching pending purchases:', pendingError);
        return new NextResponse('Error fetching pending purchases', { status: 500 });
      }

      // Update all pending purchases to completed
      if (pendingPurchases && pendingPurchases.length > 0) {
        const { error: updateError } = await supabase
          .from('purchases')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', session.id)
          .eq('status', 'pending');
          
        if (updateError) {
          console.error('Error updating purchases:', updateError);
          return new NextResponse('Error updating purchases', { status: 500 });
        }
        
        console.log(`Updated ${pendingPurchases.length} purchases to completed`);
      }

      // Check for any products that don't have a purchase record yet
      const pendingProductIds = pendingPurchases?.map(p => p.product_id) || [];
      const missingProductIds = productIds.filter(id => !pendingProductIds.includes(id));

      // Create purchase records for any missing products
      if (missingProductIds.length > 0) {
        const purchasesToCreate = missingProductIds.map(productId => ({
          user_id: userId,
          product_id: productId,
          status: 'completed',
          stripe_session_id: session.id,
          amount: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
          test_mode: process.env.STRIPE_SECRET_KEY?.includes('test')
        }));

        const { error: insertError } = await supabase
          .from('purchases')
          .insert(purchasesToCreate);
          
        if (insertError) {
          console.error('Error creating new purchases:', insertError);
          return new NextResponse('Error creating new purchases', { status: 500 });
        }
        
        console.log(`Created ${missingProductIds.length} new completed purchases`);
      }
      
      return new NextResponse('Webhook processed successfully', { status: 200 });
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new NextResponse('Error processing webhook', { status: 500 });
    }
  } else if (event.type === 'checkout.session.expired') {
    // Handle expired checkout sessions
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('Processing expired checkout session:', session.id);
    
    try {
      // Create Supabase client
      const supabase = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      // Update any pending purchases associated with this session to failed
      const { error } = await supabase
        .from('purchases')
        .update({ 
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_session_id', session.id)
        .eq('status', 'pending');
        
      if (error) {
        console.error('Error updating expired purchases:', error);
        return new NextResponse('Error updating expired purchases', { status: 500 });
      }
      
      return new NextResponse('Expired session processed successfully', { status: 200 });
    } catch (error) {
      console.error('Error processing expired session:', error);
      return new NextResponse('Error processing expired session', { status: 500 });
    }
  }
  
  // Return a response for unhandled event types
  return new NextResponse(`Unhandled event type: ${event.type}`, { status: 200 });
} 