'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Function to apply theme to document
  const applyTheme = (newTheme: Theme) => {
    // Save current scroll position
    const scrollPosition = window.scrollY;
    
    const root = document.documentElement;
    const body = document.body;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Add new theme class
    root.classList.add(newTheme);
    body.classList.add(newTheme);

    // Update color scheme
    root.style.colorScheme = newTheme;

    // Store theme preference
    localStorage.setItem('theme', newTheme);

    // Add a class to temporarily disable transitions
    root.classList.add('no-transition');

    // Update CSS variables
    if (newTheme === 'dark') {
      root.style.setProperty('--background', '#000000');
      root.style.setProperty('--foreground', '#ffffff');
      root.style.setProperty('--muted', '#1a1a1a');
      root.style.setProperty('--muted-foreground', '#999999');
      root.style.setProperty('--card', '#111111');
      root.style.setProperty('--card-foreground', '#ffffff');
    } else {
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#000000');
      root.style.setProperty('--muted', '#f1f1f1');
      root.style.setProperty('--muted-foreground', '#666666');
      root.style.setProperty('--card', '#f8f8f8');
      root.style.setProperty('--card-foreground', '#000000');
    }

    // Force a reflow to apply styles instantly
    void root.offsetHeight;

    // Remove the no-transition class after a short delay
    requestAnimationFrame(() => {
      root.classList.remove('no-transition');
      
      // Restore scroll position
      window.scrollTo(0, scrollPosition);
    });
  };

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  // Handle system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const userTheme = localStorage.getItem('theme');
      if (!userTheme) {
        const newTheme: Theme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{mounted && children}</div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 