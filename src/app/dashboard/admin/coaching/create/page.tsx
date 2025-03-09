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
import { ArrowLeft, Info, Loader2, PlusCircle } from 'lucide-react';
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
import { createCoachingService } from '@/app/actions/admin';

// Define the form schema
const formSchema = z.object({
  title: z.string().default("One-on-One Coaching"),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  initial_consultation_price: z.coerce.number().min(0, 'Price must be a positive number'),
  published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCoachingServicePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdServiceId, setCreatedServiceId] = useState<string | null>(null);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "One-on-One Coaching",
      description: '',
      initial_consultation_price: 200, // Default price for initial consultation
      published: false,
    },
  });
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Debug user information
  console.log('User:', user);
  console.log('App metadata:', user?.app_metadata);
  console.log('Is admin?', isAdmin);
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!isAdmin) {
      toast.error('You do not have permission to create coaching services');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // First try with the server action
      const result = await createCoachingService({
        title: values.title,
        description: values.description,
        initial_consultation_price: values.initial_consultation_price,
        image_url: null,
        published: values.published,
      });
      
      if (result.success) {
        toast.success('Coaching service created successfully');
        setCreatedServiceId(result.data.id);
        return;
      }
      
      console.log('Server action failed, trying API endpoint:', result.error);
      
      // If server action fails, try the API endpoint
      const response = await fetch('/api/admin/coaching/create-service', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API failed: ${errorData.message}`);
      }
      
      const data = await response.json();
      toast.success('Coaching service created successfully');
      setCreatedServiceId(data.id);
    } catch (error) {
      console.error('Error creating coaching service:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create coaching service');
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
  
  // If service was created, show success and next steps
  if (createdServiceId) {
    return (
      <div className="container py-8 max-w-3xl mx-auto">
        <Button variant="outline" size="sm" asChild className="mb-6">
          <Link href="/dashboard/admin/coaching" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Coaching Management
          </Link>
        </Button>
        
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 mb-8">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">Coaching Service Created Successfully!</CardTitle>
            <CardDescription>
              Your coaching service has been created. Now you need to add pricing tiers to make it available to users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              For the best presentation, we recommend creating 3 pricing tiers (e.g., Basic, Standard, Premium) 
              with different session counts and price points.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href={`/dashboard/admin/coaching/plans/create?serviceId=${createdServiceId}`} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Create Pricing Tiers
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/coaching">
              Return to Coaching Management
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/admin/coaching/plans/create?serviceId=${createdServiceId}`}>
              Continue to Create Pricing Tiers
            </Link>
          </Button>
        </div>
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
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create Coaching Service</h1>
        <p className="text-muted-foreground">
          Create a new coaching service with pricing tiers. After creating the service, you'll be able to add subscription plans.
        </p>
      </div>
      
      <Card className="bg-muted/50 border-dashed mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">How Coaching Services Work</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Service Structure:</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Each coaching service has an initial consultation fee (default $200)</li>
                <li>After creating the service, you'll add pricing tiers (subscription plans)</li>
                <li>Users can book a one-time consultation or subscribe to a monthly plan</li>
                <li>For best results, create 3 pricing tiers for each service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">Display Format:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Your coaching service will be displayed on the build page with:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Service description at the top</li>
                <li>Initial consultation card with the one-time fee</li>
                <li>Pricing tier cards for monthly subscription options</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
                      Set the price for an initial one-time consultation. We recommend keeping this at $200 for all services.
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
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Service
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Debug section */}
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Troubleshooting</h3>
            <p className="text-xs text-muted-foreground mb-2">
              If you're having issues creating a coaching service, click the button below to check your permissions.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/debug-role');
                    const data = await response.json();
                    console.log('User role debug info:', data);
                    toast.info(`Admin status: ${data.isAdmin ? 'Yes' : 'No'}`);
                  } catch (error) {
                    console.error('Error checking role:', error);
                    toast.error('Failed to check role');
                  }
                }}
              >
                Check Permissions
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  try {
                    const values = form.getValues();
                    
                    // Use the API endpoint
                    const response = await fetch('/api/admin/coaching/create-service', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        title: "One-on-One Coaching",
                        description: values.description || 'This is a test service created with the API endpoint.',
                        initial_consultation_price: values.initial_consultation_price || 200,
                        image_url: null,
                        published: values.published || false,
                      }),
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(`API failed: ${errorData.message}`);
                    }
                    
                    const data = await response.json();
                    console.log('API result:', data);
                    
                    toast.success('Test service created successfully with API');
                    setCreatedServiceId(data.id);
                  } catch (error) {
                    console.error('Error with API:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to use API');
                  }
                }}
              >
                Test API Endpoint
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 