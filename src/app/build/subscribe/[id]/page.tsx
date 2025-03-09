'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, CreditCard, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

type SubscriptionPlan = {
  id: string;
  service_id: string;
  title: string;
  description: string;
  price_per_month: number;
  sessions_per_month: number;
  created_at: string;
  updated_at: string;
  service: {
    id: string;
    title: string;
    description: string;
  };
};

export default function SubscribePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchPlanDetails = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        // Fetch subscription plan details with service info
        const { data, error } = await supabase
          .from('coaching_subscription_plans')
          .select(`
            *,
            service:coaching_services (
              id,
              title,
              description
            )
          `)
          .eq('id', params.id)
          .single();
          
        if (error) {
          console.error('Error fetching subscription plan:', error);
          toast.error('Subscription plan not found');
          router.push('/build');
          return;
        }
        
        setPlan(data);
      } catch (error) {
        console.error('Error in fetchPlanDetails:', error);
        toast.error('Failed to load subscription plan details');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchPlanDetails();
    }
  }, [params.id, router]);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signin?callbackUrl=/build/subscribe/${params.id}`);
    }
  }, [user, authLoading, router, params.id]);
  
  const handleSubscribe = async () => {
    if (!user) {
      toast.error('You must be signed in to subscribe');
      router.push(`/signin?callbackUrl=/build/subscribe/${params.id}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a Stripe checkout session for the subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan?.id,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }
      
      // Redirect to Stripe checkout
      router.push(`/checkout?session_id=${data.sessionId}`);
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!plan) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Not Found</CardTitle>
            <CardDescription>
              The subscription plan you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/build">Back to Coaching Services</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/build" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Coaching Services
        </Link>
      </Button>
      
      <Card className="border border-border/40 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Subscribe to {plan.title}</CardTitle>
          <CardDescription>
            Get regular coaching sessions to accelerate your digital marketing success.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">{plan.service.title}</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{plan.sessions_per_month} coaching sessions per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>60-minute sessions</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>1-on-1 personalized coaching</span>
                </div>
              </div>
              
              <div className="text-3xl font-bold mb-2">${plan.price_per_month.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <p className="text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
            </div>
            
            <div className="md:w-1/2 bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">What's included:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Monthly recurring coaching sessions</li>
                    <li>Flexible scheduling of your sessions</li>
                    <li>Access to coaching materials and resources</li>
                    <li>Email support between sessions</li>
                    <li>Cancel your subscription at any time</li>
                  </ul>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">How it works:</div>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Subscribe to your chosen plan</li>
                    <li>Schedule your first session from your dashboard</li>
                    <li>Meet with your coach via video call</li>
                    <li>Implement strategies and track progress</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSubscribe} 
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Subscribe Now
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 