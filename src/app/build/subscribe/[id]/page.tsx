'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, CreditCard, Loader2, Users, Info, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PRICING_TIERS, INITIAL_CONSULTATION_PRICE } from '@/lib/pricing-tiers';

export default function SubscribePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [plan, setPlan] = useState<typeof PRICING_TIERS[0] | null>(null);
  
  useEffect(() => {
    // Find the plan based on the ID
    const foundPlan = PRICING_TIERS.find(p => p.id === params.id);
    setPlan(foundPlan || null);
    
    // Load preferred days from localStorage if available
    try {
      const savedDays = localStorage.getItem('preferredCoachingDays');
      if (savedDays) {
        setPreferredDays(JSON.parse(savedDays));
      }
    } catch (error) {
      console.error('Error loading preferred days from localStorage:', error);
    }
    
    // Simulate loading for a smoother experience
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [params.id]);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signin?callbackUrl=/build/subscribe/${params.id}`);
    }
  }, [user, authLoading, router, params.id]);
  
  const handlePreferredDayToggle = (day: string) => {
    setPreferredDays(current => 
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };
  
  const handleSubscribe = async () => {
    if (!user) {
      toast.error('You must be signed in to subscribe');
      router.push(`/signin?callbackUrl=/build/subscribe/${params.id}`);
      return;
    }
    
    if (!plan) {
      toast.error('Invalid subscription plan');
      return;
    }
    
    if (preferredDays.length === 0) {
      toast.error('Please select at least one preferred day for your coaching sessions');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Save preferred days to localStorage
      localStorage.setItem('preferredCoachingDays', JSON.stringify(preferredDays));
      
      // Create a Stripe checkout session for the subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          planTitle: plan.title,
          price: plan.price_per_month,
          initialConsultationPrice: INITIAL_CONSULTATION_PRICE,
          sessionsPerMonth: plan.sessions_per_month,
          preferredDays: preferredDays,
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
  
  // Days of the week for recurring sessions
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
  ];
  
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
              The subscription plan you're looking for doesn't exist.
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
            Get regular coaching sessions to help you build anything you want.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">One-on-One Coaching</h3>
              <p className="text-muted-foreground mb-4">{plan.description}</p>
              
              <div className="space-y-2 mb-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="text-3xl font-bold mb-2">${plan.price_per_month.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">/month</span></div>
              <p className="text-sm text-muted-foreground mb-1">Billed monthly, cancel anytime</p>
              <p className="text-sm text-muted-foreground">+ ${INITIAL_CONSULTATION_PRICE.toFixed(2)} one-time setup fee</p>
            </div>
            
            <div className="md:w-1/2 bg-muted/30 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">What's included:</div>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>{plan.sessions_per_month} monthly coaching sessions</li>
                    <li>Flexible scheduling on your preferred days</li>
                    <li>Access to coaching materials and resources</li>
                    <li>Email support between sessions</li>
                    <li>Cancel your subscription at any time</li>
                  </ul>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">How it works:</div>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Subscribe to your chosen plan</li>
                    <li>Schedule your sessions on your preferred days</li>
                    <li>Meet with your coach via video call</li>
                    <li>Build your project with expert guidance</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Select Your Preferred Days</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Choose the days you prefer for your coaching sessions. We'll schedule your {plan.sessions_per_month} monthly 
              {plan.sessions_per_month === 1 ? ' session' : ' sessions'} on these days.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`subscribe-${day.value}`} 
                    checked={preferredDays.includes(day.value)}
                    onCheckedChange={() => handlePreferredDayToggle(day.value)}
                  />
                  <Label htmlFor={`subscribe-${day.value}`}>{day.label}</Label>
                </div>
              ))}
            </div>
            {preferredDays.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Please select at least one preferred day</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleSubscribe} 
            disabled={isSubmitting || preferredDays.length === 0}
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