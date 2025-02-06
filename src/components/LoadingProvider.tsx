'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setResourceLoaded: (resourceId: string) => void;
  addResource: (resourceId: string) => void;
  resourceStatus: Map<string, boolean>;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const resourceStatusRef = useRef(new Map<string, boolean>());
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxLoadingTimeRef = useRef<NodeJS.Timeout | null>(null);
  const minLoadTimeMetRef = useRef(false);

  const addResource = (resourceId: string) => {
    if (!resourceStatusRef.current.has(resourceId)) {
      resourceStatusRef.current.set(resourceId, false);
      setUpdateTrigger(prev => prev + 1);
    }
  };

  const setResourceLoaded = (resourceId: string) => {
    if (resourceStatusRef.current.has(resourceId)) {
      resourceStatusRef.current.set(resourceId, true);
      setUpdateTrigger(prev => prev + 1);
    }
  };

  // Cleanup function for timeouts
  const cleanupTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (maxLoadingTimeRef.current) {
      clearTimeout(maxLoadingTimeRef.current);
      maxLoadingTimeRef.current = null;
    }
  };

  // Ensure minimum loading time for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      minLoadTimeMetRef.current = true;
      setUpdateTrigger(prev => prev + 1);
    }, 500); // Reduced from 1000ms to 500ms

    return () => clearTimeout(timer);
  }, []);

  // Set maximum loading time
  useEffect(() => {
    maxLoadingTimeRef.current = setTimeout(() => {
      console.log('Max loading time reached, forcing completion');
      setIsLoading(false);
    }, 4000); // Reduced from 5s to 4s maximum

    return cleanupTimeouts;
  }, []);

  // Handle resource loading status
  useEffect(() => {
    const allLoaded = Array.from(resourceStatusRef.current.values()).every(status => status);
    const hasResources = resourceStatusRef.current.size > 0;

    if (hasResources && allLoaded && minLoadTimeMetRef.current) {
      console.log('All resources loaded:', Array.from(resourceStatusRef.current.entries()));
      
      // Remove the additional timeout and transition immediately
      setIsLoading(false);
      cleanupTimeouts();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [updateTrigger]);

  useEffect(() => {
    return () => {
      cleanupTimeouts();
      resourceStatusRef.current.clear();
    };
  }, []);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setResourceLoaded, 
      addResource,
      resourceStatus: resourceStatusRef.current 
    }}>
      {children}
    </LoadingContext.Provider>
  );
} 