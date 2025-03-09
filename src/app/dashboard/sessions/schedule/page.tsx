'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

type UserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  plan: {
    id: string;
    title: string;
    sessions_per_month: number;
    service: {
      id: string;
      title: string;
    };
  };
};

// Define the form schema
const formSchema = z.object({
  subscription_id: z.string().min(1, 'Please select a subscription'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
});

type FormValues = z.infer<typeof formSchema>;

export default function ScheduleSessionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subscription_id: '',
      title: 'Coaching Session',
      description: '',
      date: '',
      time: '',
    },
  });
  
  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!authLoading && !user) {
      router.push('/signin?callbackUrl=/dashboard/sessions/schedule');
      return;
    }
    
    if (user) {
      fetchSubscriptions();
    }
  }, [user, authLoading, router]);
  
  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Fetch user's subscriptions with plan details
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:coaching_subscription_plans (
            id,
            title,
            sessions_per_month,
            service:coaching_services (
              id,
              title
            )
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to load subscriptions');
        setSubscriptions([]);
      } else {
        setSubscriptions(data || []);
        
        // Set default subscription if there's only one
        if (data && data.length === 1) {
          form.setValue('subscription_id', data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Create a Date object from the selected date and time
      const scheduledAt = new Date(`${values.date}T${values.time}`);
      
      // Check if the date is valid
      if (isNaN(scheduledAt.getTime())) {
        toast.error('Invalid date or time selected');
        setIsSubmitting(false);
        return;
      }
      
      const supabase = createClientComponentClient();
      
      // Insert the coaching session
      const { data, error } = await supabase
        .from('coaching_sessions')
        .insert({
          user_id: user?.id,
          subscription_id: values.subscription_id,
          title: values.title,
          description: values.description || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 60, // Default to 60 minutes
          status: 'scheduled',
          meeting_url: null, // Will be set by admin later
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Coaching session scheduled successfully');
      
      // Redirect to the sessions page
      router.push('/dashboard/sessions');
    } catch (error) {
      console.error('Error scheduling session:', error);
      toast.error('Failed to schedule session');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        });
      }
    }
    
    return dates;
  };
  
  // Available time slots (9 AM to 5 PM, hourly)
  const getAvailableTimeSlots = () => {
    const times = [];
    
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      times.push({
        value: `${formattedHour}:00:00`,
        label: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
      });
    }
    
    return times;
  };
  
  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user has active subscriptions
  if (subscriptions.length === 0) {
    return (
      <div className="container py-8">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard/sessions" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Sessions
          </Link>
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscriptions</CardTitle>
            <CardDescription>
              You need an active subscription to schedule coaching sessions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Subscribe to a coaching plan to schedule regular coaching sessions.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/build">Browse Coaching Services</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimeSlots();
  
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard/sessions" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Sessions
        </Link>
      </Button>
      
      <Card className="border border-border/40 shadow-lg">
        <CardHeader>
          <CardTitle>Schedule a Coaching Session</CardTitle>
          <CardDescription>
            Book a coaching session with your digital marketing expert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subscription_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Subscription</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded-md"
                        {...field}
                      >
                        <option value="">Select a subscription</option>
                        {subscriptions.map((subscription) => (
                          <option key={subscription.id} value={subscription.id}>
                            {subscription.plan.service.title} - {subscription.plan.title}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormDescription>
                      Choose which subscription to use for this session.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Title</FormLabel>
                    <FormControl>
                      <input
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g., Monthly Strategy Session"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Give your session a descriptive title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what you'd like to discuss in this session..."
                        className="min-h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide any specific topics or questions you'd like to cover.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Date</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="">Select a date</option>
                          {availableDates.map((date) => (
                            <option key={date.value} value={date.value}>
                              {date.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        Choose a weekday in the next two weeks.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Time</FormLabel>
                      <FormControl>
                        <select
                          className="w-full p-2 border rounded-md"
                          {...field}
                        >
                          <option value="">Select a time</option>
                          {availableTimes.map((time) => (
                            <option key={time.value} value={time.value}>
                              {time.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormDescription>
                        All sessions are 60 minutes long.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    'Schedule Session'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 