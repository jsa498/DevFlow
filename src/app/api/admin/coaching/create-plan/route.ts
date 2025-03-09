import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const values = await request.json();
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    console.log('API - Creating subscription plan with admin client');
    console.log('API - Values:', values);
    
    // Create the subscription plan using the admin client
    const { data, error } = await supabaseAdmin
      .from('coaching_subscription_plans')
      .insert({
        service_id: values.service_id,
        title: values.title,
        description: values.description,
        price_per_month: values.price_per_month,
        sessions_per_month: values.sessions_per_month,
      })
      .select()
      .single();
      
    if (error) {
      console.error('API - Error creating subscription plan:', error);
      return NextResponse.json(
        { message: `Failed to create subscription plan: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('API - Subscription plan created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in subscription plan creation API:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 