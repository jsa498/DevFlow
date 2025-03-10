import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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
        { error: 'You must be logged in to purchase products' },
        { status: 401 }
      );
    }
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase products' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one product is required' },
        { status: 400 }
      );
    }

    // Get all products from database
    const productIds = items.map(item => item.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);
      
    if (productsError || !products || products.length === 0) {
      return NextResponse.json(
        { error: 'No valid products found' },
        { status: 404 }
      );
    }

    // Check for already purchased products
    const { data: existingPurchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .in('product_id', productIds);
      
    if (purchasesError) {
      console.error('Error checking existing purchases:', purchasesError);
    }

    const alreadyPurchasedIds = (existingPurchases || []).map(p => p.product_id);
    
    // Filter out already purchased products
    const productsToPurchase = products.filter(p => !alreadyPurchasedIds.includes(p.id));
    
    if (productsToPurchase.length === 0) {
      return NextResponse.json(
        { error: 'All products have already been purchased' },
        { status: 400 }
      );
    }

    // Prepare line items for Stripe
    const lineItems = productsToPurchase.map(product => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: product.title,
          description: product.description,
          images: product.image_url ? [product.image_url] : [],
        },
        unit_amount: Math.round(product.price * 100), // Convert to cents
      },
      quantity: 1,
    }));

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`,
      metadata: {
        // Store product IDs as comma-separated string in metadata
        productIds: productsToPurchase.map(p => p.id).join(','),
        userId: user.id,
      },
    });

    // Create pending purchase records for each product
    const purchasePromises = productsToPurchase.map(product => 
      supabase.from('purchases').insert({
        user_id: user.id,
        product_id: product.id,
        amount: product.price,
        status: 'pending',
      })
    );
    
    await Promise.all(purchasePromises);

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the checkout session' },
      { status: 500 }
    );
  }
} 