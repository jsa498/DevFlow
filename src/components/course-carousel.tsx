'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Carousel } from '@/components/ui/carousel';

// Using local Product interface that matches the actual structure in the application
interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  pdfUrl: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function CourseCarousel({ title, description, products }: { 
  title: string;
  description: string;
  products: Product[];
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  if (products.length === 0) {
    return null;
  }

  return (
    <div className="py-16 bg-gradient-to-b from-background to-background/95 w-full">
      <div className="container relative z-10">
        <div className="flex flex-col items-center mb-16 relative">
          <div className="absolute -top-10 w-24 h-24 bg-primary/5 rounded-full blur-xl"></div>
          <h2 className="text-4xl md:text-5xl font-bold text-center max-w-3xl leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground">
            {title}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mt-6"></div>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl text-center mx-auto">
            {description}
          </p>
        </div>

        {/* Add debug info to check products */}
        <div className="text-sm text-muted-foreground mb-4">
          Total Products: {products.length}
        </div>

        {/* Display courses in a scrollable container if there are issues with the carousel */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 mb-8 -mx-4 px-4 hide-scrollbar scroll-smooth touch-pan-x">
            <div className="flex space-x-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="group relative bg-card hover:bg-card/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 flex-shrink-0 w-80"
                >
                  <div className="relative h-52 w-full overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-muted group-hover:bg-muted/80 transition-colors">
                        <svg
                          className="h-16 w-16 text-muted-foreground/50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col h-56">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      <Link href={`/courses/${product.id}`} className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        {product.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
                      {product.description}
                    </p>
                    <div className="mt-auto">
                      <Link
                        href={`/courses/${product.id}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        View Details <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gradient indicator to show more content is available */}
          {products.length > 3 && (
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          )}
        </div>

        {/* Original carousel - can be hidden if direct approach works better */}
        <Carousel 
          slidesToShow={Math.min(3, products.length)}
          autoPlay={true}
          autoPlayInterval={6000}
          showArrows={true}
          showDots={true}
          gap={24}
          loop={true}
          className="pb-12 w-full hidden"
        >
          {products.map((product) => (
            <div key={product.id} className="group relative bg-card hover:bg-card/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 h-full">
              <div className="relative h-52 w-full overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted group-hover:bg-muted/80 transition-colors">
                    <svg
                      className="h-16 w-16 text-muted-foreground/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col h-[calc(100%-13rem)]">
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                  <Link href={`/courses/${product.id}`} className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {product.title}
                  </Link>
                </h3>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
                  {product.description}
                </p>
                <div className="mt-auto">
                  <Link
                    href={`/courses/${product.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    View Details <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
        
        <div className="flex justify-center mt-8">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
          >
            View All Courses <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
} 