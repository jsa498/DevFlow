'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  initial_consultation_price: z.coerce.number().min(0, 'Price must be a positive number'),
  image_url: z.string().optional(),
  published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCoachingServicePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      initial_consultation_price: 200, // Default price for initial consultation
      image_url: '',
      published: false,
    },
  });
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!isAdmin) {
      toast.error('You do not have permission to create coaching services');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClientComponentClient();
      
      // Create the coaching service
      const { data: service, error: serviceError } = await supabase
        .from('coaching_services')
        .insert({
          title: values.title,
          description: values.description,
          initial_consultation_price: values.initial_consultation_price,
          image_url: values.image_url || null,
          published: values.published,
        })
        .select()
        .single();
        
      if (serviceError) {
        throw new Error(`Failed to create coaching service: ${serviceError.message}`);
      }
      
      toast.success('Coaching service created successfully');
      
      // Redirect to the coaching management page
      router.push('/dashboard/admin/coaching');
    } catch (error) {
      console.error('Error creating coaching service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create coaching service');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
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
          <CardTitle>Create New Coaching Service</CardTitle>
          <CardDescription>
            Fill in the details to create a new coaching service. You can add subscription plans after creating the service.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Digital Marketing Coaching" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your coaching service.
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
                    <FormLabel>Service Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what clients will learn and gain from this coaching service..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of the coaching service and its benefits.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="initial_consultation_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Consultation Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set the price for an initial one-time consultation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      A URL to an image that represents your coaching service. We'll add image upload functionality later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Service</FormLabel>
                      <FormDescription>
                        When enabled, the coaching service will be visible to users.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Service'
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