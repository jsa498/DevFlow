import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export async function POST(request: Request) {
  try {
    // Import Stripe dynamically
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    
    // Create Supabase client using auth helpers for session
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    // Get the current session
    const { data: { session: authSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !authSession) {
      console.error('No session found:', sessionError);
      return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401 });
    }
    
    const user = authSession.user;
    console.log('Creating checkout session for user:', user.id);
    
    const body = await request.json();
    const items = body.items;

    if (!items || !Array.isArray(items)) {
      console.error('Invalid items array in request:', body);
      return new Response(JSON.stringify({ error: 'Invalid items' }), { status: 400 });
    }

    // Check if user has already purchased any of these items
    for (const item of items) {
      const { data: existingPurchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('product_id', item.id)
        .eq('status', 'completed')
        .single();

      if (purchaseError && purchaseError.code !== 'PGRST116') {
        console.error('Error checking existing purchase:', purchaseError);
      }

      if (existingPurchase) {
        console.log('User has already purchased item:', item.id);
        return new Response(
          JSON.stringify({ error: 'You have already purchased this item' }), 
          { status: 400 }
        );
      }
    }

    // Get product details
    const productIds = items.map(item => item.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);
      
    if (productsError || !products) {
      console.error('Error fetching products:', productsError);
      return new Response(
        JSON.stringify({ error: 'Error fetching products' }), 
        { status: 500 }
      );
    }

    console.log('Found products:', products.map(p => ({ id: p.id, title: p.title })));

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        product_ids: products.map(p => p.id).join(',')
      },
      line_items: products.map((product) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.title,
            description: product.description,
            images: product.image_url ? [product.image_url] : undefined,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      })),
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
    });

    console.log('Created Stripe session:', stripeSession.id);

    // Create pending purchases
    for (const product of products) {
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          product_id: product.id,
          amount: product.price,
          status: 'pending',
          stripe_session_id: stripeSession.id,
          test_mode: process.env.STRIPE_TEST_MODE === 'true'
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Error creating pending purchase:', purchaseError);
        // Continue with other purchases even if one fails
      } else {
        console.log('Created pending purchase:', purchase.id);
      }
    }

    return new Response(JSON.stringify({ sessionId: stripeSession.id }));
  } catch (error) {
    console.error('Error in checkout:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
} 