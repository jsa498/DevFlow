'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowRight, Calendar, Check, Clock, Users, Code, Sparkles, Zap } from 'lucide-react';
import { PRICING_TIERS, INITIAL_CONSULTATION_PRICE } from '@/lib/pricing-tiers';

export default function BuildPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading for a smoother experience
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show loading state
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="relative py-8 md:py-12 overflow-hidden mb-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 dark:opacity-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-primary blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground mb-4">
            One-on-One Coaching to Build Anything
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mb-4 mx-auto"></div>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Get personalized guidance from industry experts to build anything you want. Whether it's designing a website, 
            creating an app, or building with AI - we'll help you bring your ideas to life. Choose a plan that fits your needs 
            and start building today.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-primary" />
              <span>Front & Back-end Development</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Integration</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Personalized Support</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-16">
        <div className="space-y-10">
          {/* Subscription Plans */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {PRICING_TIERS.map((plan) => (
                <div key={plan.id} className="flex">
                  <Card 
                    className={`border shadow-lg hover:shadow-xl transition-all flex flex-col w-full
                      ${plan.isPopular 
                        ? 'border-primary/50 shadow-primary/10 relative mt-0 md:-mt-4' 
                        : 'border-border/40'}`
                    }
                  >
                    {plan.isPopular && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <CardHeader className={`text-center ${plan.isPopular ? 'pt-8' : 'pt-6'}`}>
                      <CardTitle className="text-xl">{plan.title}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center flex-grow">
                      <div className="text-4xl font-bold mb-2">${plan.price_per_month.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                      <div className="text-sm text-muted-foreground mb-6">
                        + ${INITIAL_CONSULTATION_PRICE} one-time setup fee
                      </div>
                      <ul className="space-y-3 text-left mx-auto max-w-xs">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-4 pb-6">
                      <Button 
                        asChild 
                        className={`w-full ${plan.isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={plan.isPopular ? "default" : "outline"}
                        size="lg"
                      >
                        <Link href={`/build/subscribe/${plan.id}`}>
                          Subscribe Now
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 