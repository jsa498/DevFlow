'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Edit, PlusCircle, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

type CoachingService = {
  id: string;
  title: string;
  description: string;
  initial_consultation_price: number;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  subscription_plans?: SubscriptionPlan[];
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

export default function CoachingManagementPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [services, setServices] = useState<CoachingService[]>([]);
  const [loading, setLoading] = useState(true);
  
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
      const { data: servicesData, error: servicesError } = await supabase
        .from('coaching_services')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (servicesError) {
        console.error('Error fetching coaching services:', servicesError);
        toast.error('Failed to load coaching services');
        setServices([]);
        return;
      }
      
      // Get subscription plans for each service
      const servicesWithPlans = await Promise.all(
        servicesData.map(async (service) => {
          const { data: plansData, error: plansError } = await supabase
            .from('coaching_subscription_plans')
            .select('*')
            .eq('service_id', service.id)
            .order('price_per_month', { ascending: true });
            
          if (plansError) {
            console.error(`Error fetching plans for service ${service.id}:`, plansError);
            return { ...service, subscription_plans: [] };
          }
          
          return { ...service, subscription_plans: plansData || [] };
        })
      );
      
      setServices(servicesWithPlans);
    } catch (error) {
      console.error('Error in fetchCoachingServices:', error);
      toast.error('Failed to load coaching services');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this coaching service? This will also delete all associated subscription plans and cannot be undone.')) {
      return;
    }

    try {
      const supabase = createClientComponentClient();
      
      // Delete the coaching service (cascade will handle subscription plans)
      const { error } = await supabase
        .from('coaching_services')
        .delete()
        .eq('id', serviceId);
        
      if (error) {
        console.error('Error deleting coaching service:', error);
        toast.error('Failed to delete coaching service');
      } else {
        // Update the local state
        setServices(services.filter(service => service.id !== serviceId));
        toast.success('Coaching service deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting coaching service:', error);
      toast.error('Failed to delete coaching service');
    }
  };

  const handleTogglePublished = async (service: CoachingService) => {
    try {
      const supabase = createClientComponentClient();
      
      // Update the published status
      const { error } = await supabase
        .from('coaching_services')
        .update({ published: !service.published })
        .eq('id', service.id);
        
      if (error) {
        console.error('Error updating coaching service:', error);
        toast.error('Failed to update coaching service');
      } else {
        // Update the local state
        setServices(services.map(s => 
          s.id === service.id 
            ? { ...s, published: !service.published } 
            : s
        ));
        toast.success(`Service ${service.published ? 'unpublished' : 'published'} successfully`);
      }
    } catch (error) {
      console.error('Error updating coaching service:', error);
      toast.error('Failed to update coaching service');
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
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Coaching Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage coaching services and subscription plans</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/dashboard/admin/coaching/create" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Create New Service
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/coaching/sessions" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Manage Sessions
            </Link>
          </Button>
        </div>
      </div>
      
      {services.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Coaching Services Found</CardTitle>
            <CardDescription>
              You haven't created any coaching services yet. Get started by creating your first service.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/admin/coaching/create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Create Your First Service
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-8">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="mt-1">
                      Initial Consultation: ${service.initial_consultation_price.toFixed(2)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.published ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Subscription Plans</h3>
                  {service.subscription_plans && service.subscription_plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {service.subscription_plans.map((plan) => (
                        <Card key={plan.id} className="bg-muted/40">
                          <CardHeader className="p-4">
                            <CardTitle className="text-base">{plan.title}</CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Price:</span>
                              <span className="font-medium">${plan.price_per_month.toFixed(2)}/month</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Sessions:</span>
                              <span className="font-medium">{plan.sessions_per_month} per month</span>
                            </div>
                          </CardContent>
                          <CardFooter className="p-4 pt-0">
                            <Button asChild variant="outline" size="sm" className="w-full">
                              <Link href={`/dashboard/admin/coaching/plans/${plan.id}`}>
                                Edit Plan
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                      <Card className="bg-muted/20 border-dashed border-2 flex items-center justify-center h-[180px]">
                        <Button asChild variant="ghost" className="flex flex-col h-full w-full">
                          <Link href={`/dashboard/admin/coaching/plans/create?serviceId=${service.id}`} className="flex flex-col items-center justify-center gap-2 h-full">
                            <PlusCircle className="h-8 w-8 text-muted-foreground" />
                            <span className="text-muted-foreground">Add Plan</span>
                          </Link>
                        </Button>
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground mb-4">No subscription plans added yet.</p>
                      <Button asChild size="sm">
                        <Link href={`/dashboard/admin/coaching/plans/create?serviceId=${service.id}`}>
                          <PlusCircle className="h-4 w-4 mr-2" /> Add Subscription Plan
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t bg-muted/10 p-4">
                <Button 
                  variant={service.published ? "outline" : "default"} 
                  size="sm"
                  onClick={() => handleTogglePublished(service)}
                >
                  {service.published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/dashboard/admin/coaching/${service.id}`}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Service
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteService(service.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 