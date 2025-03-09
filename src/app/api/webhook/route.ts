import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import type { Stripe as StripeType } from 'stripe';

export async function POST(req: Request) {
  try {
    // Import Stripe dynamically
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Verify the event
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      endpointSecret
    );

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Handle the event
    switch (event.type) {
      // Handle one-time payment events
      case 'checkout.session.completed': {
        const session = event.data.object as StripeType.Checkout.Session;
        
        // Check if this is a subscription or one-time payment
        if (session.mode === 'subscription') {
          // Handle subscription checkout
          const userId = session.metadata?.userId;
          const planId = session.metadata?.planId;
          const subscriptionId = session.subscription as string;
          
          if (userId && planId && subscriptionId) {
            // Get subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            // Insert subscription record
            const { error } = await supabase
              .from('user_subscriptions')
              .insert({
                user_id: userId,
                plan_id: planId,
                stripe_subscription_id: subscriptionId,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              });
              
            if (error) {
              console.error('Error inserting subscription record:', error);
            }
          }
        } else {
          // Handle one-time payment
          const productIds = session.metadata?.productIds;
          const userId = session.metadata?.userId;
          
          // Check if this is a consultation booking
          const isConsultation = session.metadata?.isConsultation === 'true';
          const serviceId = session.metadata?.serviceId;
          const scheduledAt = session.metadata?.scheduledAt;
          
          if (isConsultation && userId && serviceId && scheduledAt) {
            // Insert coaching session record
            const { error } = await supabase
              .from('coaching_sessions')
              .insert({
                user_id: userId,
                title: 'Initial Consultation',
                description: 'One-time consultation session',
                scheduled_at: scheduledAt,
                status: 'scheduled',
              });
              
            if (error) {
              console.error('Error inserting coaching session record:', error);
            }
          } else if (productIds && userId) {
            // Handle regular product purchase
            const productIdArray = productIds.split(',');
            
            // Update all purchases to completed
            for (const productId of productIdArray) {
              const { error } = await supabase
                .from('purchases')
                .update({ status: 'completed' })
                .eq('user_id', userId)
                .eq('product_id', productId)
                .eq('status', 'pending');
                
              if (error) {
                console.error('Error updating purchase status:', error);
              }
            }
          }
        }
        break;
      }
      
      // Handle subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as StripeType.Subscription;
        const subscriptionId = subscription.id;
        const status = subscription.status;
        const userId = subscription.metadata?.userId;
        const planId = subscription.metadata?.planId;
        
        if (userId && planId) {
          // Update subscription status
          const { error } = await supabase
            .from('user_subscriptions')
            .update({
              status: status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId);
            
          if (error) {
            console.error('Error updating subscription status:', error);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as StripeType.Subscription;
        const subscriptionId = subscription.id;
        
        // Update subscription status to canceled
        const { error } = await supabase
          .from('user_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscriptionId);
          
        if (error) {
          console.error('Error updating subscription status to canceled:', error);
        }
        break;
      }
      
      // Handle checkout session expiration
      case 'checkout.session.expired': {
        const session = event.data.object as StripeType.Checkout.Session;
        const productIds = session.metadata?.productIds;
        const userId = session.metadata?.userId;

        if (productIds && userId) {
          // Handle multiple products (comma-separated IDs)
          const productIdArray = productIds.split(',');
          
          // Update all purchases to failed
          for (const productId of productIdArray) {
            const { error } = await supabase
              .from('purchases')
              .update({ status: 'failed' })
              .eq('user_id', userId)
              .eq('product_id', productId)
              .eq('status', 'pending');
              
            if (error) {
              console.error('Error updating purchase status:', error);
            }
          }
        }
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 