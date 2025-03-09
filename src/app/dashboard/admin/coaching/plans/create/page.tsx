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
import { ArrowLeft, Info, Loader2, Plus } from 'lucide-react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { createSubscriptionPlan } from '@/app/actions/admin';

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

// Predefined pricing tier templates
const pricingTemplates = [
  {
    name: "Basic, Standard, Premium",
    tiers: [
      { title: "Basic Plan", description: "Perfect for beginners who need occasional guidance", price_per_month: 50, sessions_per_month: 1 },
      { title: "Standard Plan", description: "Our most popular plan for consistent progress", price_per_month: 80, sessions_per_month: 2 },
      { title: "Premium Plan", description: "Intensive coaching for rapid skill development", price_per_month: 120, sessions_per_month: 3 }
    ]
  },
  {
    name: "Starter, Pro, Enterprise",
    tiers: [
      { title: "Starter Tier", description: "Essential coaching for individuals just starting out", price_per_month: 60, sessions_per_month: 1 },
      { title: "Pro Tier", description: "Advanced coaching for serious skill development", price_per_month: 100, sessions_per_month: 2 },
      { title: "Enterprise Tier", description: "Comprehensive coaching for professional growth", price_per_month: 150, sessions_per_month: 4 }
    ]
  },
  {
    name: "Weekly, Bi-Weekly, Monthly",
    tiers: [
      { title: "Monthly Session", description: "One session per month for periodic check-ins", price_per_month: 50, sessions_per_month: 1 },
      { title: "Bi-Weekly Sessions", description: "Two sessions per month for steady progress", price_per_month: 90, sessions_per_month: 2 },
      { title: "Weekly Sessions", description: "Four sessions per month for intensive coaching", price_per_month: 160, sessions_per_month: 4 }
    ]
  }
];

export default function CreateSubscriptionPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get('serviceId');
  
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [services, setServices] = useState<CoachingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  
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
  
  // Apply template to form
  const applyTemplate = (templateIndex: number) => {
    setSelectedTemplate(templateIndex);
    const template = pricingTemplates[templateIndex];
    if (template) {
      // Apply the first tier from the template
      const tier = template.tiers[0];
      form.setValue('title', tier.title);
      form.setValue('description', tier.description);
      form.setValue('price_per_month', tier.price_per_month);
      form.setValue('sessions_per_month', tier.sessions_per_month);
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
      // First try with the API endpoint
      try {
        const apiResponse = await fetch('/api/admin/coaching/create-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: values.service_id,
            title: values.title,
            description: values.description,
            price_per_month: values.price_per_month,
            sessions_per_month: values.sessions_per_month,
          }),
        });
        
        if (apiResponse.ok) {
          const data = await apiResponse.json();
          toast.success('Subscription plan created successfully');
          
          // Handle template logic
          if (selectedTemplate !== null) {
            const template = pricingTemplates[selectedTemplate];
            const currentTierIndex = template.tiers.findIndex(
              tier => tier.title === values.title && tier.sessions_per_month === values.sessions_per_month
            );
            
            if (currentTierIndex >= 0 && currentTierIndex < template.tiers.length - 1) {
              // There's another tier in the template, set up the form for it
              const nextTier = template.tiers[currentTierIndex + 1];
              form.reset({
                service_id: values.service_id,
                title: nextTier.title,
                description: nextTier.description,
                price_per_month: nextTier.price_per_month,
                sessions_per_month: nextTier.sessions_per_month,
              });
              
              toast.info(`Created tier ${currentTierIndex + 1} of ${template.tiers.length}. Please submit the next tier.`);
              setIsSubmitting(false);
              return;
            }
          }
          
          // Redirect to the coaching management page
          router.push('/dashboard/admin/coaching');
          return;
        }
        
        // If API fails, throw an error to try the server action
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || 'API failed');
      } catch (apiError) {
        console.log('API endpoint failed, trying server action:', apiError);
        
        // Try the server action as a fallback
        const result = await createSubscriptionPlan({
          service_id: values.service_id,
          title: values.title,
          description: values.description,
          price_per_month: values.price_per_month,
          sessions_per_month: values.sessions_per_month,
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Server action failed');
        }
        
        toast.success('Subscription plan created successfully with server action');
        
        // Handle template logic
        if (selectedTemplate !== null) {
          const template = pricingTemplates[selectedTemplate];
          const currentTierIndex = template.tiers.findIndex(
            tier => tier.title === values.title && tier.sessions_per_month === values.sessions_per_month
          );
          
          if (currentTierIndex >= 0 && currentTierIndex < template.tiers.length - 1) {
            // There's another tier in the template, set up the form for it
            const nextTier = template.tiers[currentTierIndex + 1];
            form.reset({
              service_id: values.service_id,
              title: nextTier.title,
              description: nextTier.description,
              price_per_month: nextTier.price_per_month,
              sessions_per_month: nextTier.sessions_per_month,
            });
            
            toast.info(`Created tier ${currentTierIndex + 1} of ${template.tiers.length}. Please submit the next tier.`);
            setIsSubmitting(false);
            return;
          }
        }
        
        // Redirect to the coaching management page
        router.push('/dashboard/admin/coaching');
      }
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
    <div className="container py-8 max-w-4xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard/admin/coaching" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Coaching Management
        </Link>
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create Pricing Tiers</h1>
        <p className="text-muted-foreground">
          Create subscription plans that will be displayed as pricing tiers on the coaching services page.
          For the best presentation, create 3 tiers for each service (e.g., Basic, Standard, Premium).
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 md:col-span-3 bg-muted/50 border-dashed">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">How Pricing Tiers Work</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Best Practices:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Create 3 pricing tiers for each coaching service</li>
                  <li>Make the middle tier your "recommended" or most popular option</li>
                  <li>Ensure clear value differentiation between tiers</li>
                  <li>Use consistent naming across your tiers (e.g., Basic/Standard/Premium)</li>
                  <li>Include the $200 initial consultation fee in all plans</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Display Format:</h3>
                <p className="text-sm text-muted-foreground">
                  Your pricing tiers will be displayed as attractive cards on the coaching page, with the middle tier 
                  highlighted as "Most Popular". Each tier will show the monthly price, session count, and other benefits.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="custom" className="mb-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="template">Use Template</TabsTrigger>
          <TabsTrigger value="custom">Custom Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="template" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingTemplates.map((template, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer hover:border-primary/50 transition-all ${selectedTemplate === index ? 'border-primary' : ''}`}
                onClick={() => applyTemplate(index)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="space-y-1 text-sm">
                    {template.tiers.map((tier, tierIndex) => (
                      <div key={tierIndex} className="flex justify-between">
                        <span>{tier.title}</span>
                        <span className="font-medium">${tier.price_per_month}/mo</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={selectedTemplate === index ? "default" : "outline"} 
                    size="sm" 
                    className="w-full"
                    onClick={() => applyTemplate(index)}
                  >
                    Use This Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {selectedTemplate !== null && (
            <div className="bg-muted/30 p-4 rounded-lg mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Note:</strong> You'll create each tier one at a time. After submitting the first tier, 
                the form will automatically update for the next tier in the template.
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="custom" className="pt-4">
          <p className="text-sm text-muted-foreground mb-4">
            Create a custom subscription plan. For the best presentation, create multiple tiers with increasing value.
          </p>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Subscription Plan</CardTitle>
          <CardDescription>
            {selectedTemplate !== null 
              ? `Creating tier for ${pricingTemplates[selectedTemplate].name} template` 
              : 'Create a subscription plan for a coaching service.'}
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
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {selectedTemplate !== null ? 'Create This Tier' : 'Create Subscription Plan'}
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
              If you're having issues creating a pricing tier, click the button below to check your permissions or test the API.
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
                    const response = await fetch('/api/admin/coaching/create-plan', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        service_id: values.service_id || serviceId,
                        title: values.title || 'Test Plan',
                        description: values.description || 'This is a test plan created with the API endpoint.',
                        price_per_month: values.price_per_month || 50,
                        sessions_per_month: values.sessions_per_month || 1,
                      }),
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(`API failed: ${errorData.message}`);
                    }
                    
                    const data = await response.json();
                    console.log('API result:', data);
                    
                    toast.success('Test plan created successfully with API');
                    router.push('/dashboard/admin/coaching');
                  } catch (error) {
                    console.error('Error with API:', error);
                    toast.error(error instanceof Error ? error.message : 'Failed to use API');
                  }
                }}
              >
                Test API Endpoint
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  try {
                    const values = form.getValues();
                    
                    // Use the server action
                    const result = await createSubscriptionPlan({
                      service_id: values.service_id || serviceId || '',
                      title: values.title || 'Test Plan',
                      description: values.description || 'This is a test plan created with the server action.',
                      price_per_month: values.price_per_month || 50,
                      sessions_per_month: values.sessions_per_month || 1,
                    });
                    
                    console.log('Server action result:', result);
                    
                    if (result.success) {
                      toast.success('Test plan created successfully with server action');
                      router.push('/dashboard/admin/coaching');
                    } else {
                      toast.error(`Server action failed: ${result.error}`);
                    }
                  } catch (error) {
                    console.error('Error with server action:', error);
                    toast.error('Failed to use server action');
                  }
                }}
              >
                Test Server Action
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 