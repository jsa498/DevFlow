'use client';

import HeroAnimation from './HeroAnimation';

export default function HeroScene() {
  return (
    <div className="absolute inset-0" style={{ background: 'transparent' }}>
      {/* Initial background gradient - more subtle */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(25, 25, 112, 0.05) 0%, rgba(0, 0, 0, 0.2) 100%)'
        }}
      />
      
      {/* Spline Robot */}
      <div className="absolute inset-0">
        <HeroAnimation />
      </div>

      {/* Ambient light effect - more subtle */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(65, 105, 225, 0.05) 0%, transparent 60%)'
        }}
      />

      {/* Bottom blend gradient - more subtle */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5))',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
} 