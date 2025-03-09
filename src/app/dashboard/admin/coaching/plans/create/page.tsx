'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

// Define the form schema
const formSchema = z.object({
  service_id: z.string().min(1, 'Please select a coaching service'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price_per_month: z.coerce.number().min(0, 'Price must be a positive number'),
  sessions_per_month: z.coerce.number().int().min(1, 'Must have at least 1 session per month'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateSubscriptionPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [services, setServices] = useState<CoachingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_id: serviceId || '',
      title: '',
      description: '',
      price_per_month: 50, // Default price
      sessions_per_month: 1, // Default sessions per month
    },
  });
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchCoachingServices();
    }
  }, [user, authLoading, isAdmin, router]);
  
  const fetchCoachingServices = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Get all coaching services
      const { data, error } = await supabase
        .from('coaching_services')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching coaching services:', error);
        toast.error('Failed to load coaching services');
        setServices([]);
      } else {
        setServices(data || []);
      }
    } catch (error) {
      console.error('Error in fetchCoachingServices:', error);
      toast.error('Failed to load coaching services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!isAdmin) {
      toast.error('You do not have permission to create subscription plans');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClientComponentClient();
      
      // Create the subscription plan
      const { data: plan, error: planError } = await supabase
        .from('coaching_subscription_plans')
        .insert({
          service_id: values.service_id,
          title: values.title,
          description: values.description,
          price_per_month: values.price_per_month,
          sessions_per_month: values.sessions_per_month,
        })
        .select()
        .single();
        
      if (planError) {
        throw new Error(`Failed to create subscription plan: ${planError.message}`);
      }
      
      toast.success('Subscription plan created successfully');
      
      // Redirect to the coaching management page
      router.push('/dashboard/admin/coaching');
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading || loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || !isAdmin) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard/admin/coaching" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Coaching Management
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Subscription Plan</CardTitle>
          <CardDescription>
            Create a subscription plan for a coaching service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coaching Service</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={!!serviceId} // Disable if serviceId is provided in URL
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a coaching service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the coaching service this plan belongs to.
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
                    <FormLabel>Plan Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Basic Plan, Premium Plan" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your subscription plan.
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
                    <FormLabel>Plan Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what clients will get with this subscription plan..." 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of what's included in this subscription plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price_per_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set the monthly subscription price.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="sessions_per_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sessions Per Month</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" step="1" {...field} />
                      </FormControl>
                      <FormDescription>
                        How many coaching sessions are included per month.
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
                      Creating...
                    </>
                  ) : (
                    'Create Subscription Plan'
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