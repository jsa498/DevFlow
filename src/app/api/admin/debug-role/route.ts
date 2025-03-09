import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not logged in', isLoggedIn: false },
        { status: 200 }
      );
    }
    
    // Get user info
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    // Check profiles table as well
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        app_metadata: user.app_metadata,
        user_metadata: user.user_metadata,
      },
      isAdmin,
      profile,
      session: {
        expires_at: session.expires_at,
        token_type: session.token_type,
      }
    });
  } catch (error) {
    console.error('Error in debug role API:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
} 