'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from './LoadingProvider';

export default function GlobalLoadingScreen() {
  const { isLoading, resourceStatus } = useLoading();
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const preventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    if (isLoading && overlayRef.current) {
      // Prevent all interactions
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.top = '0';
      document.body.style.left = '0';

      // Add touch event prevention
      overlayRef.current.addEventListener('touchmove', preventTouchMove, { passive: false });
      overlayRef.current.addEventListener('wheel', preventScroll, { passive: false });
      overlayRef.current.addEventListener('scroll', preventScroll, { passive: false });

      // Ensure video plays
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Video playback failed - show poster instead
            if (videoRef.current) {
              videoRef.current.style.opacity = '0';
            }
          });
        }
      }
    }

    return () => {
      // Cleanup
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.top = '';
      document.body.style.left = '';

      if (overlayRef.current) {
        overlayRef.current.removeEventListener('touchmove', preventTouchMove);
        overlayRef.current.removeEventListener('wheel', preventScroll);
        overlayRef.current.removeEventListener('scroll', preventScroll);
      }
    };
  }, [isLoading]);

  // Calculate loading progress
  const loadedCount = Array.from(resourceStatus.values()).filter(Boolean).length;
  const totalCount = resourceStatus.size;
  const progress = totalCount > 0 ? Math.round((loadedCount / totalCount) * 100) : 0;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] bg-black"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            touchAction: 'none',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              className="w-full h-full object-cover transition-opacity duration-300"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ opacity: 1 }}
            >
              <source src="/load-page-animation.mp4" type="video/mp4" />
            </video>
            <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center justify-center gap-2">
              <div className="text-white/80 text-sm font-medium">
                Loading{totalCount > 0 ? ` (${progress}%)` : '...'}
              </div>
              {totalCount > 0 && (
                <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 