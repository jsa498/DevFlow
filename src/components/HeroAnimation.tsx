'use client';

import { useRef, useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application, SPEObject } from '@splinetool/runtime';

interface HeroAnimationProps {
  onLoad?: () => void;
}

export default function HeroAnimation({ onLoad }: HeroAnimationProps) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bodyRef = useRef<SPEObject | null>(null);
  const headRef = useRef<SPEObject | null>(null);
  const splineRef = useRef<Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Store initial rotations for body and head separately.
  const initialBodyRotationRef = useRef({ x: 0, y: 0 });
  const initialHeadRotationRef = useRef({ x: 0, y: 0 });

  // For head tracking, keep the current and target rotations.
  const currentHeadRotationRef = useRef({ x: 0, y: 0 });
  const targetHeadRotationRef = useRef({ x: 0, y: 0 });

  const animationFrameRef = useRef<number | null>(null);

  // onLoad: Called when the Spline scene is loaded.
  const handleLoad = (splineApp: Application) => {
    try {
      splineRef.current = splineApp;
      // Get the robot body (e.g., named "Bot")
      const robot = splineApp.findObjectByName('Bot');
      if (robot) {
        bodyRef.current = robot;
        if (robot.rotation) {
          initialBodyRotationRef.current = { x: robot.rotation.x, y: robot.rotation.y };
          robot.rotation.x = initialBodyRotationRef.current.x;
          robot.rotation.y = initialBodyRotationRef.current.y;
        }
      }
      
      const head = splineApp.findObjectByName('Head');
      if (head) {
        headRef.current = head;
        if (head.rotation) {
          initialHeadRotationRef.current = { x: head.rotation.x, y: head.rotation.y };
          currentHeadRotationRef.current = { ...initialHeadRotationRef.current };
          targetHeadRotationRef.current = { ...initialHeadRotationRef.current };
        }
      }

      setIsLoading(false);
      if (onLoad) {
        onLoad();
      }
    } catch (error) {
      console.error('Error loading Spline scene:', error);
      setLoadError(error instanceof Error ? error.message : 'Failed to load 3D scene');
    }
  };

  // Helper: Linear interpolation.
  const lerp = (start: number, end: number, factor: number) =>
    start + (end - start) * factor;

  // Mapping function for mouse input:
  const mapMouseInput = (
    value: number,
    deadZone = 0.05,
    sensitivity = 1.0,
    exponent = 1.2
  ) => {
    if (Math.abs(value) < deadZone) return 0;
    const sign = value < 0 ? -1 : 1;
    const normalized = (Math.abs(value) - deadZone) / (1 - deadZone);
    const eased = Math.pow(normalized, exponent);
    return sign * eased * sensitivity;
  };

  useEffect(() => {
    // Mouse move handler: update the head's target rotation based on the mouse's position.
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isLoading && headRef.current) {
        // Get coordinates whether it's mouse or touch
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        // Normalize the position to a [-1, 1] range.
        const rawX = (clientX / window.innerWidth) * 2 - 1;
        const rawY = (clientY / window.innerHeight) * 2 - 1;

        // Process the raw values with optimized mapping
        const mappedX = mapMouseInput(rawX, 0.05, 0.8, 1.2); // Reduced sensitivity
        const mappedY = mapMouseInput(rawY, 0.05, 0.8, 1.2);

        // Update the target head rotation with throttling
        requestAnimationFrame(() => {
          targetHeadRotationRef.current = {
            x: initialHeadRotationRef.current.x + mappedY,
            y: initialHeadRotationRef.current.y + mappedX,
          };
        });
      }
    };

    // Reset head rotation to initial when interaction ends
    const handleInteractionEnd = () => {
      if (!isLoading && headRef.current) {
        targetHeadRotationRef.current = { ...initialHeadRotationRef.current };
      }
    };

    // Add both mouse and touch event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleInteractionEnd);
    window.addEventListener('touchend', handleInteractionEnd);

    let lastTime = performance.now();
    let frameCount = 0;
    const FRAME_THROTTLE = 2; // Only update every 2nd frame

    const animate = () => {
      frameCount++;
      if (frameCount % FRAME_THROTTLE !== 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const now = performance.now();
      const deltaTime = (now - lastTime) / (1000 * FRAME_THROTTLE);
      lastTime = now;

      if (!isLoading && headRef.current && headRef.current.rotation) {
        const smoothing = 4; // Slightly reduced for smoother movement
        const t = 1 - Math.exp(-smoothing * deltaTime);

        currentHeadRotationRef.current.x = lerp(
          currentHeadRotationRef.current.x,
          targetHeadRotationRef.current.x,
          t
        );
        currentHeadRotationRef.current.y = lerp(
          currentHeadRotationRef.current.y,
          targetHeadRotationRef.current.y,
          t
        );

        // Apply transforms with hardware acceleration
        if (headRef.current.rotation) {
          headRef.current.rotation.x = currentHeadRotationRef.current.x;
          headRef.current.rotation.y = currentHeadRotationRef.current.y;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('mouseleave', handleInteractionEnd);
      window.removeEventListener('touchend', handleInteractionEnd);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isLoading]);

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        <p>Failed to load 3D scene. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-full"
      style={{ 
        position: 'relative',
        minHeight: '100vh',
        minWidth: '100vw',
        overflow: 'hidden',
        transform: 'translateZ(0)', // Force GPU acceleration
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        willChange: 'transform'
      }}
    >
      <Spline
        scene="/scene.splinecode"
        onLoad={handleLoad}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate3d(-50%, -50%, 0)', // Use translate3d for GPU acceleration
          background: 'transparent',
          willChange: 'transform',
          backfaceVisibility: 'hidden'
        }}
      />
    </div>
  );
}
