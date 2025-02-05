'use client';

import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RainbowButtonProps {
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export default function RainbowButton({ 
  href, 
  className = '', 
  children,
  onClick
}: RainbowButtonProps) {
  const buttonClasses = cn(
    "group relative inline-flex h-12 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-4 sm:px-6 py-2 font-medium text-white transition-all duration-300 [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    // before styles - reduced glow effect
    "before:absolute before:bottom-[-10%] before:left-1/2 before:z-0 before:h-1/6 before:w-1/2 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.6*1rem))]",
    // Dark style for all buttons
    "bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),linear-gradient(rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.3)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] hover:bg-[linear-gradient(rgba(0,0,0,0.9),rgba(0,0,0,0.9)),linear-gradient(rgba(0,0,0,0.6)_50%,rgba(0,0,0,0.4)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
    className
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
} 