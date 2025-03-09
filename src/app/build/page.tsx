'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ArrowRight, Calendar, Clock, Users } from 'lucide-react';

type CoachingService = {
  id: string;
  title: string;
  description: string;
  initial_consultation_price: number;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type SubscriptionPlan = {
  id: string;
  service_id: string;
  title: string;
  description: string;
  price_per_month: number;
  sessions_per_month: number;
  created_at: string;
  updated_at: string;
};

export default function BuildPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [services, setServices] = useState<CoachingService[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCoachingServices = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        // Fetch coaching services
        const { data: servicesData, error: servicesError } = await supabase
          .from('coaching_services')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
          
        if (servicesError) {
          console.error('Error fetching coaching services:', servicesError);
          setServices([]);
        } else {
          setServices(servicesData || []);
          
          // If we have services, fetch subscription plans
          if (servicesData && servicesData.length > 0) {
            const serviceIds = servicesData.map(service => service.id);
            
            const { data: plansData, error: plansError } = await supabase
              .from('coaching_subscription_plans')
              .select('*')
              .in('service_id', serviceIds)
              .order('price_per_month', { ascending: true });
              
            if (plansError) {
              console.error('Error fetching subscription plans:', plansError);
              setPlans([]);
            } else {
              setPlans(plansData || []);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchCoachingServices:', error);
        setServices([]);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoachingServices();
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
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground mb-4">
            Personalized Coaching Services
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-3xl">
            Take your digital marketing skills to the next level with personalized coaching from industry experts. 
            Book a consultation or subscribe to a coaching plan to get regular guidance and support.
          </p>
        </div>
      </div>
      
      {services.length === 0 ? (
        <Card className="border border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle>No Coaching Services Available</CardTitle>
            <CardDescription>
              We're currently setting up our coaching services. Please check back soon!
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="outline">
              <Link href="/products">Browse Our Products</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-12">
          {services.map((service) => (
            <div key={service.id} className="space-y-6">
              <Card className="border border-border/40 shadow-lg overflow-hidden">
                <div className="md:flex">
                  {service.image_url && (
                    <div className="md:w-1/3 h-64 md:h-auto">
                      <img 
                        src={service.image_url} 
                        alt={service.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className={`${service.image_url ? 'md:w-2/3' : 'w-full'} p-6`}>
                    <CardHeader className="p-0 pb-4">
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 pb-6">
                      <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2">Initial Consultation</h3>
                        <p className="text-muted-foreground mb-4">
                          Book a one-time consultation to discuss your needs and goals.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold">${service.initial_consultation_price.toFixed(2)}</div>
                          <Button asChild>
                            <Link href={`/build/consultation/${service.id}`}>
                              Book Consultation <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
              
              <h3 className="text-xl font-semibold mt-8 mb-4">Subscription Plans</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans
                  .filter(plan => plan.service_id === service.id)
                  .map((plan) => (
                    <Card key={plan.id} className="border border-border/40 shadow-lg hover:shadow-xl transition-all hover:border-primary/20">
                      <CardHeader>
                        <CardTitle>{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold mb-4">${plan.price_per_month.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-primary" />
                            <span>{plan.sessions_per_month} coaching sessions per month</span>
                          </li>
                          <li className="flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-primary" />
                            <span>60-minute sessions</span>
                          </li>
                          <li className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-primary" />
                            <span>1-on-1 personalized coaching</span>
                          </li>
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button asChild className="w-full">
                          <Link href={`/build/subscribe/${plan.id}`}>
                            Subscribe Now
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 