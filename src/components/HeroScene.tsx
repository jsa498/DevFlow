'use client';

import { useState, useRef } from 'react';
import HeroAnimation from './HeroAnimation';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from './LoadingProvider';

export default function HeroScene() {
  const [isInteractive, setIsInteractive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { addResource, setResourceLoaded } = useLoading();

  // Register the Spline model as a resource to load
  useState(() => {
    addResource('spline-model');
  });

  const handleSplineLoad = () => {
    setIsInteractive(true);
    setResourceLoaded('spline-model');
  };

  return (
    <div className="relative w-full h-full min-h-screen" style={{ position: 'relative' }}>
      {/* Initial background gradient - more subtle */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
          zIndex: 0
        }}
      />
      
      {/* Loading Animation */}
      <AnimatePresence>
        {!isInteractive && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/load-page-animation.mp4" type="video/mp4" />
            </video>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spline Robot */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <div 
          style={{ 
            width: '100%',
            height: '100%',
            opacity: isInteractive ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
        >
          <HeroAnimation onLoad={handleSplineLoad} />
        </div>
      </div>

      {/* Ambient light effect - more subtle */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(65, 105, 225, 0.05) 0%, transparent 60%)',
          zIndex: 2
        }}
      />

      {/* Bottom blend gradient - more subtle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5))',
          mixBlendMode: 'multiply',
          zIndex: 3
        }}
      />
    </div>
  );
} 