import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';

export default function ProductsPage() {
  return (
    <main className="bg-background min-h-screen pb-16">
      {/* Hero section */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 dark:opacity-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-primary blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground mb-6">
              Digital Marketing Products
            </h1>
          </div>
        </div>
      </div>
      
      {/* Coming Soon */}
      <div className="container mx-auto px-4 mt-4">
        <div className="max-w-3xl mx-auto bg-card/50 border border-border/50 rounded-2xl p-16 text-center">
          <div className="flex justify-center mb-8">
            <Clock className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Coming Soon</h2>
          <div className="inline-flex items-center justify-center py-1 px-3 rounded-full bg-muted text-sm font-medium mb-8">
            <span className="mr-2 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            In development
          </div>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
            We're currently working on exciting new digital marketing products to help you 
            grow your business. Check back soon or sign up to be notified when they're 
            available.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
            >
              Explore Our Courses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-background/80 text-foreground border border-border px-6 py-3 rounded-full hover:bg-background transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
} 