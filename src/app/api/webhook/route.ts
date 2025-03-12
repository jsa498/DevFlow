import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Create a Supabase client
  const supabase = createRouteHandlerClient({ cookies });

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.log('Processing completed checkout session:', session.id);
    
    try {
      // Get the customer ID from the session
      const customerId = session.customer as string;
      const userId = session.client_reference_id;
      
      if (!userId) {
        console.error('No user ID found in session:', session.id);
        return new NextResponse('No user ID found in session', { status: 400 });
      }
      
      console.log(`Processing purchase for user: ${userId}, session: ${session.id}`);
      
      // Get line items from the session
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      
      // Process each line item as a purchase
      for (const item of lineItems.data) {
        // Get the product ID from the line item description or metadata
        const productId = item.price?.product as string;
        
        if (!productId) {
          console.error('No product ID found for line item:', item.id);
          continue;
        }
        
        // Get the product details from Stripe
        const stripeProduct = await stripe.products.retrieve(productId);
        
        // Get the product ID from metadata (this should be your Supabase product ID)
        const supabaseProductId = stripeProduct.metadata.product_id;
        
        if (!supabaseProductId) {
          console.error('No Supabase product ID found in Stripe product metadata:', productId);
          continue;
        }
        
        console.log(`Processing product: ${supabaseProductId} for user: ${userId}`);
        
        // Check if there's already a completed purchase for this product and user
        const { data: existingPurchases, error: existingError } = await supabase
          .from('purchases')
          .select('id, status')
          .eq('user_id', userId)
          .eq('product_id', supabaseProductId)
          .eq('status', 'completed');
          
        if (existingError) {
          console.error('Error checking existing purchases:', existingError);
          continue;
        }
        
        if (existingPurchases && existingPurchases.length > 0) {
          console.log(`User ${userId} already has a completed purchase for product ${supabaseProductId}`);
          continue; // Skip this product as it's already purchased
        }
        
        // Check if there's a pending purchase to update
        const { data: pendingPurchases, error: pendingError } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('product_id', supabaseProductId)
          .eq('status', 'pending');
          
        if (pendingError) {
          console.error('Error checking pending purchases:', pendingError);
          continue;
        }
        
        if (pendingPurchases && pendingPurchases.length > 0) {
          // Update the pending purchase to completed
          const { error: updateError } = await supabase
            .from('purchases')
            .update({
              status: 'completed',
              amount: item.amount_total / 100, // Convert from cents to dollars
              stripe_session_id: session.id,
              test_mode: process.env.NODE_ENV !== 'production'
            })
            .eq('id', pendingPurchases[0].id);
            
          if (updateError) {
            console.error('Error updating purchase:', updateError);
            continue;
          }
          
          console.log(`Updated purchase ${pendingPurchases[0].id} to completed for user ${userId}, product ${supabaseProductId}`);
        } else {
          // Create a new purchase record
          const { error: insertError } = await supabase
            .from('purchases')
            .insert({
              user_id: userId,
              product_id: supabaseProductId,
              status: 'completed',
              amount: item.amount_total / 100, // Convert from cents to dollars
              stripe_session_id: session.id,
              test_mode: process.env.NODE_ENV !== 'production'
            });
            
          if (insertError) {
            console.error('Error creating purchase:', insertError);
            continue;
          }
          
          console.log(`Created new completed purchase for user ${userId}, product ${supabaseProductId}`);
        }
      }
      
      console.log(`Successfully processed all purchases for session: ${session.id}`);
      
    } catch (error) {
      console.error('Error processing checkout session:', error);
      return new NextResponse('Error processing checkout session', { status: 500 });
    }
  }

  return new NextResponse('Webhook received', { status: 200 });
} 