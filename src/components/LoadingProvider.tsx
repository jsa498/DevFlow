'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setResourceLoaded: (resourceId: string) => void;
  addResource: (resourceId: string) => void;
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
  const [resources] = useState<Set<string>>(new Set());
  const [loadedResources] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  const addResource = (resourceId: string) => {
    if (!resources.has(resourceId)) {
      resources.add(resourceId);
      setIsInitialized(true); // Mark as initialized when first resource is added
    }
  };

  const setResourceLoaded = (resourceId: string) => {
    if (!loadedResources.has(resourceId)) {
      loadedResources.add(resourceId);
    }
  };

  useEffect(() => {
    if (!isInitialized) return;

    const allResourcesLoaded = resources.size > 0 && loadedResources.size >= resources.size;
    
    if (allResourcesLoaded) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [resources.size, loadedResources.size, isInitialized]);

  // Ensure loading screen shows for at least 1 second
  useEffect(() => {
    const minLoadingTime = setTimeout(() => {
      setIsInitialized(true);
    }, 1000);

    return () => clearTimeout(minLoadingTime);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setResourceLoaded, addResource }}>
      {children}
    </LoadingContext.Provider>
  );
} 