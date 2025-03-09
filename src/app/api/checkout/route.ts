import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Import Stripe dynamically
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Get the current session from cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const accessToken = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('sb-access-token='))
      ?.split('=')[1];
      
    if (!accessToken) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase a product' },
        { status: 401 }
      );
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase a product' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product from database
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if user already purchased the product
    const { data: existingPurchase, error: purchaseError } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('status', 'completed')
      .single();

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You have already purchased this product' },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.title,
              description: product.description,
              images: product.imageUrl ? [product.imageUrl] : [],
            },
            unit_amount: Math.round(product.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        productId: product.id,
        userId: user.id,
      },
    });

    // Create a pending purchase record
    const { error: insertError } = await supabase
      .from('purchases')
      .insert({
        user_id: user.id,
        product_id: product.id,
        amount: product.price,
        status: 'pending',
      });
      
    if (insertError) {
      console.error('Error creating purchase record:', insertError);
    }

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the checkout session' },
      { status: 500 }
    );
  }
} 