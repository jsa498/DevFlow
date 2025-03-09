import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Check if the user is authenticated and is an admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Create profiles table if it doesn't exist
    const { error: profilesError } = await supabase.rpc('create_profiles_table');
    
    if (profilesError && !profilesError.message.includes('already exists')) {
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }
    
    // Create SQL function to create profiles table
    const { error: functionError } = await supabase.rpc('create_sql_function_for_profiles');
    
    if (functionError && !functionError.message.includes('already exists')) {
      return NextResponse.json({ error: functionError.message }, { status: 500 });
    }
    
    // Create trigger for new users
    const { error: triggerError } = await supabase.rpc('create_auth_trigger');
    
    if (triggerError && !triggerError.message.includes('already exists')) {
      return NextResponse.json({ error: triggerError.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database setup completed successfully' 
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ 
      error: 'An error occurred while setting up the database' 
    }, { status: 500 });
  }
} 