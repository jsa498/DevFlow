import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: Request) {
  try {
    // Import Stripe dynamically
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    
    // Create Supabase client using auth helpers
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'You must be logged in to purchase products' },
        { status: 401 }
      );
    }
    
    const user = session.user;
    
    if (!user) {
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

    console.log(`Creating checkout session for user ${user.id} with ${items.length} items`);

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

    console.log(`Found ${products.length} products in database`);

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
    console.log(`User has already purchased ${alreadyPurchasedIds.length} products`);
    
    // Filter out already purchased products
    const productsToPurchase = products.filter(p => !alreadyPurchasedIds.includes(p.id));
    
    if (productsToPurchase.length === 0) {
      return NextResponse.json(
        { error: 'All products have already been purchased' },
        { status: 400 }
      );
    }

    console.log(`Processing ${productsToPurchase.length} products for purchase`);

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
        test_mode: process.env.STRIPE_SECRET_KEY?.includes('test') ? 'true' : 'false',
      },
    });

    console.log(`Created Stripe checkout session: ${stripeSession.id}`);
    console.log(`Products in session: ${productsToPurchase.map(p => p.id).join(', ')}`);

    // Create pending purchase records for each product
    const purchasePromises = productsToPurchase.map(product => 
      supabase.from('purchases').insert({
        user_id: user.id,
        product_id: product.id,
        amount: product.price,
        status: 'pending',
      }).select()
    );
    
    const purchaseResults = await Promise.all(purchasePromises);
    
    // Log any errors creating pending purchases
    purchaseResults.forEach((result, index) => {
      if (result.error) {
        console.error(`Error creating pending purchase for product ${productsToPurchase[index].id}:`, result.error);
      } else {
        console.log(`Created pending purchase for product ${productsToPurchase[index].id}`);
      }
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the checkout session' },
      { status: 500 }
    );
  }
} 