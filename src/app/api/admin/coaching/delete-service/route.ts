import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: Request) {
  try {
    // Get the service ID from the URL
    const url = new URL(request.url);
    const serviceId = url.searchParams.get('id');
    
    if (!serviceId) {
      return NextResponse.json(
        { message: 'Service ID is required' },
        { status: 400 }
      );
    }
    
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
    
    console.log('API - Deleting coaching service with admin client');
    
    // Delete the coaching service using the admin client
    const { error } = await supabaseAdmin
      .from('coaching_services')
      .delete()
      .eq('id', serviceId);
      
    if (error) {
      console.error('API - Error deleting coaching service:', error);
      return NextResponse.json(
        { message: `Failed to delete coaching service: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('API - Service deleted successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in coaching service deletion API:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 