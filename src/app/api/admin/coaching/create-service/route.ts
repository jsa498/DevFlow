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
    
    console.log('API - Creating coaching service with admin client');
    console.log('API - Values:', values);
    
    // Create the coaching service using the admin client
    const { data, error } = await supabaseAdmin
      .from('coaching_services')
      .insert({
        title: "One-on-One Coaching",
        description: values.description,
        initial_consultation_price: values.initial_consultation_price,
        image_url: null,
        published: values.published,
      })
      .select()
      .single();
      
    if (error) {
      console.error('API - Error creating coaching service:', error);
      return NextResponse.json(
        { message: `Failed to create coaching service: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('API - Service created successfully:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in coaching service creation API:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 