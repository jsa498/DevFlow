import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

export async function POST(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

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

    // First verify the Stripe session status
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ status: 'pending_payment' });
    }

    // Check if there are any purchases with this session ID
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, status, product_id, created_at')
      .eq('stripe_session_id', sessionId)
      .eq('user_id', userId);

    if (purchasesError) {
      console.error('Error verifying purchases:', purchasesError);
      return NextResponse.json(
        { error: 'Error verifying purchases' },
        { status: 500 }
      );
    }

    if (purchases && purchases.length > 0) {
      // Check if any purchases are still pending
      const pendingPurchases = purchases.filter(p => p.status === 'pending');

      if (pendingPurchases.length > 0) {
        // Update all pending purchases to completed
        const { error: updateError } = await supabase
          .from('purchases')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_session_id', sessionId)
          .eq('status', 'pending');

        if (updateError) {
          console.error('Error updating purchase status:', updateError);
          return NextResponse.json(
            { error: 'Error updating purchase status' },
            { status: 500 }
          );
        }

        // Double-check that the purchases were updated
        const { data: verifiedPurchases, error: verifyError } = await supabase
          .from('purchases')
          .select('id, status')
          .eq('stripe_session_id', sessionId)
          .eq('status', 'completed');

        if (verifyError) {
          console.error('Error verifying updated purchases:', verifyError);
        } else {
          console.log(`Verified ${verifiedPurchases?.length} completed purchases`);
        }

        return NextResponse.json({
          status: 'completed',
          updatedCount: pendingPurchases.length
        });
      }

      return NextResponse.json({
        status: 'already_completed',
        completedCount: purchases.length
      });
    }

    // If no purchases found but session is paid, create them
    if (session.metadata?.product_ids) {
      const productIds = session.metadata.product_ids.split(',');
      const purchasesToCreate = productIds.map(productId => ({
        user_id: userId,
        product_id: productId,
        status: 'completed',
        stripe_session_id: sessionId,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        test_mode: process.env.STRIPE_SECRET_KEY?.includes('test')
      }));

      const { error: createError } = await supabase
        .from('purchases')
        .insert(purchasesToCreate);

      if (createError) {
        console.error('Error creating purchases:', createError);
        return NextResponse.json(
          { error: 'Error creating purchases' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'completed',
        createdCount: purchasesToCreate.length
      });
    }

    return NextResponse.json({ status: 'no_purchases' });
  } catch (error) {
    console.error('Error in verify-purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 