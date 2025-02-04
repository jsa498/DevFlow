'use client';

import { useEffect, useRef, useState } from 'react';
import Spline from '@splinetool/react-spline';
import type { Application, SPEObject } from '@splinetool/runtime';

export default function HeroAnimation() {
  // Refs for the robot body and head nodes.
  const bodyRef = useRef<SPEObject | null>(null);
  const headRef = useRef<SPEObject | null>(null);
  const splineRef = useRef<Application | null>(null);

  // Use a single flag to enable interactivity (and hence head tracking)
  const [isInteractive, setIsInteractive] = useState(false);

  // Store initial rotations for body and head separately.
  const initialBodyRotationRef = useRef({ x: 0, y: 0 });
  const initialHeadRotationRef = useRef({ x: 0, y: 0 });

  // For head tracking, keep the current and target rotations.
  const currentHeadRotationRef = useRef({ x: 0, y: 0 });
  const targetHeadRotationRef = useRef({ x: 0, y: 0 });

  const animationFrameRef = useRef<number>();

  // onLoad: Called when the Spline scene is loaded.
  const onLoad = (splineApp: Application) => {
    splineRef.current = splineApp;
    // Get the robot body (e.g., named "Bot")
    const robot = splineApp.findObjectByName('Bot');
    if (robot) {
      bodyRef.current = robot;
      if (robot.rotation) {
        initialBodyRotationRef.current = { x: robot.rotation.x, y: robot.rotation.y };
        // Freeze the body rotation if desired:
        robot.rotation.x = initialBodyRotationRef.current.x;
        robot.rotation.y = initialBodyRotationRef.current.y;
      }
    }
    // Get the head node (adjust 'Head' to your actual node name)
    const head = splineApp.findObjectByName('Head');
    if (head) {
      headRef.current = head;
      if (head.rotation) {
        initialHeadRotationRef.current = { x: head.rotation.x, y: head.rotation.y };
        currentHeadRotationRef.current = { ...initialHeadRotationRef.current };
        targetHeadRotationRef.current = { ...initialHeadRotationRef.current };
      }
    }
    // Enable interactivity immediately (or use a very short delay, e.g., 100ms)
    setTimeout(() => {
      setIsInteractive(true);
    }, 100);
  };

  // Helper: Linear interpolation.
  const lerp = (start: number, end: number, factor: number) =>
    start + (end - start) * factor;

  // Mapping function for mouse input:
  // Here we use a very small dead zone (0.05) so that movements near the center are captured,
  // and we increase sensitivity (multiplier of 1.0). The exponent (1.2) slightly eases the response.
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
    if (!isInteractive) return;

    // Mouse move handler: update the head's target rotation based on the mouse's position.
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize the mouse position to a [-1, 1] range.
      const rawX = (e.clientX / window.innerWidth) * 2 - 1;
      const rawY = (e.clientY / window.innerHeight) * 2 - 1;

      // Process the raw values: now the mapping function uses a very small dead zone
      // so that even small movements near center yield an output.
      const mappedX = mapMouseInput(rawX, 0.05, 1.0, 1.2);
      const mappedY = mapMouseInput(rawY, 0.05, 1.0, 1.2);

      // Update the target head rotation.
      // Vertical (Y) mouse movement influences rotation around the X axis (tilt),
      // Horizontal (X) mouse movement influences rotation around the Y axis (turn).
      targetHeadRotationRef.current = {
        x: initialHeadRotationRef.current.x + mappedY,
        y: initialHeadRotationRef.current.y + mappedX,
      };
    };

    // Reset head rotation to initial when the mouse leaves.
    const handleMouseLeave = () => {
      targetHeadRotationRef.current = { ...initialHeadRotationRef.current };
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let lastTime = performance.now();

    const animate = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000; // in seconds
      lastTime = now;

      if (headRef.current && headRef.current.rotation) {
        // Smoothing factor: adjust to make the head follow faster or slower.
        const smoothing = 5;
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

        headRef.current.rotation.x = currentHeadRotationRef.current.x;
        headRef.current.rotation.y = currentHeadRotationRef.current.y;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isInteractive]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(25, 25, 112, 0.3) 0%, rgba(0, 0, 0, 0.95) 100%)',
          animation: 'gradientShift 10s ease infinite',
          zIndex: -1,
        }}
      />
      {/* Ambient light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(65, 105, 225, 0.1) 0%, transparent 60%)',
          animation: 'pulse 4s ease-in-out infinite',
          zIndex: -1,
        }}
      />
      {/* Spline scene */}
      <Spline
        scene="/nexbot_robot_character_concept.spline"
        onLoad={onLoad}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          zIndex: 1,
        }}
      />
      <style>{`
        @keyframes gradientShift {
          0% { opacity: 0.5; }
          50% { opacity: 0.8; }
          100% { opacity: 0.5; }
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
