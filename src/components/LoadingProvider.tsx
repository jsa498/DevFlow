'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
  const [resourceStatus] = useState<Map<string, boolean>>(new Map());
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  const addResource = (resourceId: string) => {
    if (!resourceStatus.has(resourceId)) {
      resourceStatus.set(resourceId, false);
      setHasStartedLoading(true);
    }
  };

  const setResourceLoaded = (resourceId: string) => {
    if (resourceStatus.has(resourceId)) {
      resourceStatus.set(resourceId, true);
      // Force a re-render
      setHasStartedLoading(prev => !prev);
    }
  };

  useEffect(() => {
    // Don't start checking until we've added at least one resource
    if (!hasStartedLoading) return;

    // Check if all resources are loaded
    const allLoaded = Array.from(resourceStatus.values()).every(status => status);
    const hasResources = resourceStatus.size > 0;

    if (hasResources && allLoaded) {
      console.log('All resources loaded:', Array.from(resourceStatus.entries()));
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasStartedLoading, resourceStatus]);

  // Ensure minimum loading time
  useEffect(() => {
    const minTimer = setTimeout(() => {
      setHasStartedLoading(true);
    }, 1500);
    return () => clearTimeout(minTimer);
  }, []);

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setResourceLoaded, 
      addResource,
      resourceStatus 
    }}>
      {children}
    </LoadingContext.Provider>
  );
} 