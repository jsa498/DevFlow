import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Import Stripe dynamically
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    
    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to create a subscription' },
        { status: 401 }
      );
    }
    
    const user = session.user;
    
    // Get request body
    const body = await req.json();
    const { planId } = body;
    
    if (!planId) {
      return NextResponse.json(
        { error: 'Subscription plan ID is required' },
        { status: 400 }
      );
    }
    
    // Get subscription plan details
    const { data: plan, error: planError } = await supabase
      .from('coaching_subscription_plans')
      .select(`
        *,
        service:coaching_services (
          id,
          title,
          description
        )
      `)
      .eq('id', planId)
      .single();
      
    if (planError || !plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }
    
    // Check if user already has an active subscription for this plan
    const { data: existingSubscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('plan_id', planId)
      .eq('status', 'active')
      .single();
      
    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription for this plan' },
        { status: 400 }
      );
    }
    
    // Create Stripe customer if it doesn't exist
    let customerId = user.user_metadata?.stripe_customer_id;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
        metadata: {
          userId: user.id,
        },
      });
      
      customerId = customer.id;
      
      // Update user metadata with Stripe customer ID
      await supabase.auth.updateUser({
        data: {
          stripe_customer_id: customerId,
        },
      });
    }
    
    // Create Stripe product if it doesn't exist
    const productName = `${plan.service.title} - ${plan.title}`;
    let product = await stripe.products.search({
      query: `metadata['plan_id']:'${planId}'`,
    });
    
    let productId;
    
    if (product.data.length === 0) {
      const newProduct = await stripe.products.create({
        name: productName,
        description: plan.description,
        metadata: {
          plan_id: planId,
        },
      });
      
      productId = newProduct.id;
    } else {
      productId = product.data[0].id;
    }
    
    // Create or get price
    let price = await stripe.prices.search({
      query: `product:'${productId}' AND metadata['plan_id']:'${planId}'`,
    });
    
    let priceId;
    
    if (price.data.length === 0) {
      const newPrice = await stripe.prices.create({
        product: productId,
        unit_amount: Math.round(plan.price_per_month * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: 'month',
        },
        metadata: {
          plan_id: planId,
        },
      });
      
      priceId = newPrice.id;
    } else {
      priceId = price.data[0].id;
    }
    
    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?subscription=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/build/subscribe/${planId}?canceled=true`,
      metadata: {
        userId: user.id,
        planId: planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: planId,
        },
      },
    });
    
    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the subscription' },
      { status: 500 }
    );
  }
} 