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

// Create a variable to track if this is the initial load
let isInitialLoad = true;

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(isInitialLoad);
  const [resources] = useState<Set<string>>(new Set());
  const [loadedResources] = useState<Set<string>>(new Set());

  const addResource = (resourceId: string) => {
    if (!resources.has(resourceId)) {
      resources.add(resourceId);
    }
  };

  const setResourceLoaded = (resourceId: string) => {
    if (!loadedResources.has(resourceId)) {
      loadedResources.add(resourceId);
      // Only trigger state update if we've loaded all resources
      if (resources.size > 0 && resources.size === loadedResources.size) {
        setTimeout(() => {
          setIsLoading(false);
          isInitialLoad = false;
        }, 500);
      }
    }
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setResourceLoaded, addResource }}>
      {children}
    </LoadingContext.Provider>
  );
} 