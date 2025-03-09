import React from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  href?: string;
  variant?: 'dark' | 'light';
  forceWhiteText?: boolean;
}

export const RainbowButton = React.forwardRef<
  HTMLButtonElement,
  RainbowButtonProps
>(({ children, className, href, variant = 'dark', forceWhiteText = false, ...props }, ref) => {
  const buttonElement = (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex h-11 animate-rainbow cursor-pointer items-center justify-center rounded-xl border-0 bg-[length:200%] px-8 py-2 font-medium transition-colors [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        // before styles
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:[filter:blur(calc(0.8*1rem))]",
        // dark variant (black button)
        variant === 'dark' && "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] text-white",
        // light variant (white button)
        variant === 'light' && !forceWhiteText && "bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] text-black",
        // light variant with forced white text
        variant === 'light' && forceWhiteText && "bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] text-white",
        // Force white text when specified
        forceWhiteText && "!text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {buttonElement}
      </Link>
    );
  }

  return buttonElement;
});

RainbowButton.displayName = "RainbowButton";

export default RainbowButton; 