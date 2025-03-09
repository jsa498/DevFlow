'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from './theme-provider';
import { ToastProvider } from './toast-provider';
import SupabaseAuthProvider from './providers/supabase-auth-provider';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <SupabaseAuthProvider>
      <ThemeProvider>
        {children}
        <ToastProvider />
      </ThemeProvider>
    </SupabaseAuthProvider>
  );
}; 