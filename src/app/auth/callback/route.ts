import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const callbackUrl = requestUrl.searchParams.get('callbackUrl') || '/';
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code);
  }
  
  // Redirect to the callback URL if provided, otherwise to the homepage
  // If the callback URL is /signin or /signup, redirect to homepage instead
  const redirectUrl = callbackUrl === '/signin' || callbackUrl === '/signup' ? '/' : callbackUrl;
  return NextResponse.redirect(new URL(redirectUrl, request.url));
} 