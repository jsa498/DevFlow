'use client';

import { useEffect, useRef } from 'react';
import { useSupabaseAuth } from './supabase-auth-provider';
import { useCartStore } from '@/lib/store/cart-store';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSupabaseAuth();
  const { syncWithSupabase, cleanup, initialized } = useCartStore();
  const initializingRef = useRef(false);

  useEffect(() => {
    // Only sync if we have a user and haven't initialized yet
    if (user?.id && !initialized && !initializingRef.current) {
      initializingRef.current = true;
      syncWithSupabase(user.id).finally(() => {
        initializingRef.current = false;
      });
    }

    // Cleanup subscription only when component unmounts or user changes
    return () => {
      if (user?.id) {
        cleanup();
      }
    };
  }, [user?.id, syncWithSupabase, cleanup, initialized]);

  return <>{children}</>;
} 