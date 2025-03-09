'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Make sure we only render once mounted to avoid hydration issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="w-9 h-9 bg-transparent"><span className="sr-only">Toggle theme</span></Button>;
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="w-9 h-9 bg-transparent hover:bg-transparent transition-colors"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun 
          className={`h-[1.2rem] w-[1.2rem] transition-all stroke-foreground ${
            theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
        <Moon 
          className={`absolute h-[1.2rem] w-[1.2rem] transition-all stroke-foreground ${
            theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
          }`} 
        />
      </div>
    </Button>
  );
} 