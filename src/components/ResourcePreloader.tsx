import { useEffect } from 'react';
import { useLoading } from './LoadingProvider';

// Add all critical images and resources here
const CRITICAL_RESOURCES = [
  '/DevLogo.png',
  '/load-page-animation.mp4'
];

export default function ResourcePreloader() {
  const { addResource, setResourceLoaded } = useLoading();

  useEffect(() => {
    // Register all resources
    CRITICAL_RESOURCES.forEach(resource => {
      addResource(resource);
    });

    // Preload images and other resources
    CRITICAL_RESOURCES.forEach(resource => {
      if (resource.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        const img = new Image();
        img.src = resource;
        img.onload = () => setResourceLoaded(resource);
        img.onerror = () => {
          console.error(`Failed to load image: ${resource}`);
          setResourceLoaded(resource); // Mark as loaded even on error to prevent hanging
        };
      } else if (resource.match(/\.(mp4|webm)$/i)) {
        const video = document.createElement('video');
        video.src = resource;
        video.onloadeddata = () => setResourceLoaded(resource);
        video.onerror = () => {
          console.error(`Failed to load video: ${resource}`);
          setResourceLoaded(resource);
        };
      } else {
        // For other resources, use fetch to check availability
        fetch(resource)
          .then(() => setResourceLoaded(resource))
          .catch((error) => {
            console.error(`Failed to load resource: ${resource}`, error);
            setResourceLoaded(resource);
          });
      }
    });
  }, [addResource, setResourceLoaded]);

  return null;
} 