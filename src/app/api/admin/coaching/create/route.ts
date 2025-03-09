import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the current user to verify they're an admin
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized: Not logged in' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      // Also check in the profiles table as a fallback
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'ADMIN') {
        return NextResponse.json(
          { message: 'Unauthorized: Admin role required' },
          { status: 403 }
        );
      }
    }
    
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
    
    // Create the coaching service using the admin client
    const { data, error } = await supabaseAdmin
      .from('coaching_services')
      .insert({
        title: values.title,
        description: values.description,
        initial_consultation_price: values.initial_consultation_price,
        image_url: values.image_url || null,
        published: values.published,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating coaching service:', error);
      return NextResponse.json(
        { message: `Failed to create coaching service: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in coaching service creation API:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 