'use client';

import { useState, useEffect } from 'react';
import HeroAnimation from './HeroAnimation';
import { motion } from 'framer-motion';
import { useLoading } from './LoadingProvider';

export default function HeroScene() {
  const [shouldInitSpline, setShouldInitSpline] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const { isLoading } = useLoading();

  // Only initialize Spline after loading is complete
  useEffect(() => {
    if (!isLoading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShouldInitSpline(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const handleSplineLoad = () => {
    console.log('Spline model loaded and ready to animate');
    setIsInteractive(true);
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
      
      {/* Spline Robot */}
      <motion.div 
        className="absolute inset-0" 
        style={{ zIndex: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isInteractive ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {shouldInitSpline && <HeroAnimation onLoad={handleSplineLoad} />}
      </motion.div>

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