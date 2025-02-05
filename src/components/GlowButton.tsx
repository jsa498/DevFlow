'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface GlowButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function GlowButton({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
}: GlowButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    const glow = glowRef.current;
    if (!button || !glow) return;

    const updateGlow = (e: MouseEvent) => {
      const bounds = button.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      
      glow.style.setProperty('--x', `${x}px`);
      glow.style.setProperty('--y', `${y}px`);
    };

    button.addEventListener('mousemove', updateGlow);
    return () => button.removeEventListener('mousemove', updateGlow);
  }, []);

  const buttonContent = (
    <motion.div
      ref={buttonRef}
      className={`relative group cursor-pointer ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        ref={glowRef}
        className={`absolute inset-0 rounded-full transition-opacity duration-500
          ${variant === 'primary' 
            ? 'bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),rgba(56,189,248,0.3)_0%,rgba(99,102,241,0.3)_25%,rgba(0,0,0,0)_50%)]'
            : 'bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),rgba(255,255,255,0.15)_0%,rgba(255,255,255,0.05)_25%,rgba(0,0,0,0)_50%)]'
          } opacity-0 group-hover:opacity-100`}
      />
      <div
        className={`relative px-6 py-3 rounded-full text-sm font-medium transition-all duration-300
          ${variant === 'primary'
            ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_25px_rgba(56,189,248,0.5)]'
            : 'bg-black/20 backdrop-blur-sm border-2 border-white/20 text-white hover:border-white/40 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]'
          }`}
      >
        {children}
      </div>
    </motion.div>
  );

  if (href) {
    return <a href={href}>{buttonContent}</a>;
  }

  return <div onClick={onClick}>{buttonContent}</div>;
} 