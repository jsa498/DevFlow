import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  try {
    // For protected routes, check if user is authenticated
    const protectedRoutes = ['/dashboard', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    if (isProtectedRoute) {
      // Create a Supabase client specifically for middleware
      const res = NextResponse.next();
      const supabase = createMiddlewareClient({ req: request, res });
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      // If no session found, redirect to sign in page
      if (!session) {
        const redirectUrl = new URL('/signin', request.url);
        redirectUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // For admin routes, check if user has admin role
      if (request.nextUrl.pathname.startsWith('/dashboard/admin')) {
        const user = session.user;
        
        // Check if user has admin role in user metadata
        const isAdmin = user.app_metadata?.role === 'admin';
        
        if (!isAdmin) {
          // Also check in the profiles table as a fallback
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (!profile || profile.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      }
      
      return res;
    }

    return NextResponse.next();
  } catch (e) {
    console.error('Middleware error:', e);
    // If there's an error, proceed without blocking the request
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 