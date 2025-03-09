import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function GET(request: NextRequest) {
  try {
    // First check if the user is authenticated and is an admin
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('API: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      console.log('API: User is not admin');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    console.log('API: User is admin, fetching all users');
    
    // Create a Supabase client with the service role key
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get all users from auth.users
    const { data, error } = await adminSupabase.auth.admin.listUsers();
    
    if (error) {
      console.error('API: Error fetching users:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    console.log('API: Successfully fetched users:', data.users.length);
    
    // Transform users to the expected format
    const formattedUsers = data.users.map(user => ({
      id: user.id,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Anonymous',
      email: user.email,
      created_at: user.created_at
    }));
    
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('API: Error in users endpoint:', error);
    return NextResponse.json({ error: 'An error occurred while fetching users' }, { status: 500 });
  }
} 