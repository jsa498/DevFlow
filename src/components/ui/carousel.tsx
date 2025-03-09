'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useAnimation, useMotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  slidesToShow?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  gap?: number;
  loop?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  className,
  itemClassName,
  slidesToShow = 3,
  autoPlay = false,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  gap = 16,
  loop = true,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [constraintWidth, setConstraintWidth] = useState(0);
  const [itemWidth, setItemWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const x = useMotionValue(0);
  const totalSlides = children.length;
  
  // Calculate the number of slides to show based on viewport width
  const [currentSlidesToShow, setCurrentSlidesToShow] = useState(slidesToShow);
  
  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        const carouselWidth = carouselRef.current.offsetWidth;
        
        // Log for debugging
        console.log(`Carousel width: ${carouselWidth}px`);
        console.log(`Total slides: ${totalSlides}`);
        
        // Adjust slides to show based on screen width
        let newSlidesToShow = slidesToShow;
        if (window.innerWidth < 640) {
          newSlidesToShow = 1;
        } else if (window.innerWidth < 768) {
          newSlidesToShow = Math.min(1, slidesToShow);
        } else if (window.innerWidth < 1024) {
          newSlidesToShow = Math.min(2, slidesToShow);
        } else if (window.innerWidth < 1280) {
          newSlidesToShow = Math.min(3, slidesToShow);
        }
        
        // Ensure we never try to show more slides than we have
        newSlidesToShow = Math.min(newSlidesToShow, totalSlides);
        console.log(`Showing ${newSlidesToShow} slides at once`);
        
        setCurrentSlidesToShow(newSlidesToShow);
        
        // Calculate item width based on carousel width, slides to show, and gap
        const newItemWidth = (carouselWidth - (newSlidesToShow - 1) * gap) / newSlidesToShow;
        setItemWidth(newItemWidth);
        
        // Calculate constraint width (total scrollable area)
        const totalWidth = (newItemWidth + gap) * totalSlides - gap;
        const viewportWidth = carouselWidth;
        setConstraintWidth(Math.max(0, totalWidth - viewportWidth));
        console.log(`Constraint width: ${Math.max(0, totalWidth - viewportWidth)}px`);
        
        // Reset position if needed
        if (activeSlide > totalSlides - newSlidesToShow) {
          const newActiveSlide = Math.max(0, totalSlides - newSlidesToShow);
          setActiveSlide(newActiveSlide);
          controls.start({ x: -newActiveSlide * (newItemWidth + gap) });
        } else {
          controls.start({ x: -activeSlide * (newItemWidth + gap) });
        }
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeSlide, controls, gap, slidesToShow, totalSlides]);
  
  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return;
    
    const interval = setInterval(() => {
      const maxSlide = Math.max(0, totalSlides - currentSlidesToShow);
      
      if (activeSlide >= maxSlide) {
        if (loop) {
          setActiveSlide(0);
          controls.start({ x: 0 });
        }
      } else {
        const nextSlide = activeSlide + 1;
        setActiveSlide(nextSlide);
        controls.start({ x: -nextSlide * (itemWidth + gap) });
      }
    }, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [activeSlide, autoPlay, autoPlayInterval, controls, currentSlidesToShow, totalSlides, loop, itemWidth, gap]);
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    if (offset > 100 || velocity > 500) {
      // Swipe right
      slidePrev();
    } else if (offset < -100 || velocity < -500) {
      // Swipe left
      slideNext();
    } else {
      // Return to the current slide if swipe wasn't strong enough
      controls.start({ x: -activeSlide * (itemWidth + gap) });
    }
  };
  
  const slideNext = () => {
    const maxSlide = Math.max(0, totalSlides - currentSlidesToShow);
    if (activeSlide >= maxSlide) {
      if (loop) {
        setActiveSlide(0);
        controls.start({ x: 0 });
      }
    } else {
      const nextSlide = activeSlide + 1;
      setActiveSlide(nextSlide);
      controls.start({ x: -nextSlide * (itemWidth + gap) });
    }
  };
  
  const slidePrev = () => {
    if (activeSlide <= 0) {
      if (loop) {
        const maxSlide = Math.max(0, totalSlides - currentSlidesToShow);
        setActiveSlide(maxSlide);
        controls.start({ x: -maxSlide * (itemWidth + gap) });
      }
    } else {
      const prevSlide = activeSlide - 1;
      setActiveSlide(prevSlide);
      controls.start({ x: -prevSlide * (itemWidth + gap) });
    }
  };
  
  if (children.length === 0) {
    return null;
  }
  
  return (
    <div
      className={cn("relative overflow-hidden w-full", className)}
      ref={carouselRef}
    >
      <motion.div
        className="flex w-full"
        style={{ gap }}
        drag="x"
        dragConstraints={{ left: -constraintWidth, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {children.map((child, index) => (
          <motion.div
            key={index}
            className={cn("flex-shrink-0", itemClassName)}
            style={{ width: itemWidth }}
          >
            {child}
          </motion.div>
        ))}
      </motion.div>
      
      {showArrows && totalSlides > currentSlidesToShow && (
        <>
          <button
            onClick={slidePrev}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-background/80 border border-border shadow-md text-primary hover:bg-background transition-colors z-10"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={slideNext}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-background/80 border border-border shadow-md text-primary hover:bg-background transition-colors z-10"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      
      {showDots && totalSlides > currentSlidesToShow && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: Math.ceil(totalSlides - currentSlidesToShow + 1) }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveSlide(index);
                controls.start({ x: -index * (itemWidth + gap) });
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                activeSlide === index
                  ? "bg-primary w-4"
                  : "bg-primary/30 hover:bg-primary/50"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}; 