'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

type SupabaseAuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
});

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      setIsLoading(false);
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user || null);
        setIsLoading(false);
        
        // Refresh the page to update server-side data
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const signInWithGoogle = async () => {
    // Get the current URL to redirect back to after authentication
    const currentPath = window.location.pathname;
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    
    // If we're on the signin page, check for a callbackUrl parameter
    const searchParams = new URLSearchParams(window.location.search);
    const redirectPath = searchParams.get('callbackUrl') || currentPath;
    
    // Add the redirectPath as a query parameter to the callback URL
    callbackUrl.searchParams.set('callbackUrl', redirectPath);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });
    
    if (error) {
      console.error('Google sign in error:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    return { error };
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
} 