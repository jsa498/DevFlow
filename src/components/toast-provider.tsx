'use client';

import { Toaster } from 'sonner';
import { useTheme } from '@/components/theme-provider';

export function ToastProvider() {
  const { theme } = useTheme();
  
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        className: 'border border-border',
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
        },
      }}
      theme={theme === 'dark' ? 'dark' : 'light'}
    />
  );
} 