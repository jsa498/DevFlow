import { useEffect, useRef } from 'react';
import { useLoading } from './LoadingProvider';

// Only include the loading animation as critical - Spline will be loaded separately
const CRITICAL_RESOURCES = [
  '/load-page-animation.mp4'
];

export default function ResourcePreloader() {
  const { addResource, setResourceLoaded } = useLoading();
  const loadingAttemptsRef = useRef(new Map<string, number>());
  const cleanupFunctionsRef = useRef<Map<string, () => void>>(new Map());
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Register all resources immediately
    CRITICAL_RESOURCES.forEach(resource => {
      addResource(resource);
      loadingAttemptsRef.current.set(resource, 0);
    });

    // Function to load video with proper cleanup
    const loadVideo = (resource: string) => {
      const video = document.createElement('video');
      let timeout: NodeJS.Timeout;
      
      const cleanup = () => {
        clearTimeout(timeout);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        video.remove();
        cleanupFunctionsRef.current.delete(resource);
      };

      cleanupFunctionsRef.current.set(resource, cleanup);

      return new Promise<void>((resolve, reject) => {
        video.preload = 'auto';

        // Track loading progress for mobile
        if ('buffered' in video) {
          progressIntervalRef.current = setInterval(() => {
            if (video.buffered.length > 0) {
              const progress = (video.buffered.end(0) / video.duration) * 100;
              if (progress > 0 && progress < 100) {
                // Update progress without marking as fully loaded
                setResourceLoaded(`${resource}-progress`);
              }
            }
          }, 100);
        }

        const handleLoad = () => {
          console.log('Video loaded successfully:', resource);
          cleanup();
          resolve();
        };

        const handleError = (error: Event) => {
          console.error('Video load error:', error);
          cleanup();
          reject(error);
        };

        video.addEventListener('loadeddata', handleLoad, { once: true });
        video.addEventListener('error', handleError, { once: true });

        timeout = setTimeout(() => {
          console.log('Video load timeout:', resource);
          cleanup();
          reject(new Error('Video load timeout'));
        }, 3000);

        video.src = resource;
      });
    };

    // Load each resource with retry logic
    const loadResource = async (resource: string) => {
      const attempts = loadingAttemptsRef.current.get(resource) || 0;
      
      if (attempts >= 2) {
        console.warn(`Max retries reached for ${resource}, marking as loaded`);
        setResourceLoaded(resource);
        return;
      }

      try {
        if (resource.match(/\.(mp4|webm)$/i)) {
          await loadVideo(resource);
          setResourceLoaded(resource);
        }
      } catch (error) {
        loadingAttemptsRef.current.set(resource, attempts + 1);
        console.error(`Failed to load ${resource}, attempt ${attempts + 1}/2`);
        
        const retryTimeout = setTimeout(() => {
          loadResource(resource);
        }, 1000);

        cleanupFunctionsRef.current.set(`retry-${resource}`, () => clearTimeout(retryTimeout));
      }
    };

    // Start loading all resources
    CRITICAL_RESOURCES.forEach(loadResource);

    // Cleanup function
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      cleanupFunctionsRef.current.forEach(cleanup => cleanup());
      cleanupFunctionsRef.current.clear();
      loadingAttemptsRef.current.clear();
    };
  }, [addResource, setResourceLoaded]);

  return null;
} 