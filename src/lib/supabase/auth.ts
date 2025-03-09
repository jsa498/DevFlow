import { supabase } from './client';
import { Provider } from '@supabase/supabase-js';

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
}

// Sign in with OAuth provider (Google, etc.)
export async function signInWithOAuth(provider: Provider) {
  // Get the current URL origin (works for both localhost and production)
  const redirectUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/callback` 
    : process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
      : 'https://www.devflow.ca/auth/callback';
      
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });
  
  return { data, error };
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

// Get current user
export async function getUser() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
}

// Set up auth state change listener
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
} 