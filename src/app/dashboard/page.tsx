'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ShoppingBasket, Download, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch user's purchases and subscriptions if authenticated
    if (user) {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          
          // Fetch purchases
          const { data: purchasesData, error: purchasesError } = await supabase
            .from('purchases')
            .select(`
              id,
              amount,
              status,
              created_at,
              product:products (
                id,
                title,
                description,
                price,
                imageUrl,
                pdfUrl
              )
            `)
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });
            
          if (purchasesError) throw purchasesError;
          
          setPurchases(purchasesData || []);
          
          // Fetch subscriptions
          const { data: subscriptionsData, error: subscriptionsError } = await supabase
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
            .eq('user_id', user.id)
            .in('status', ['active', 'trialing'])
            .order('created_at', { ascending: false });
            
          if (subscriptionsError) throw subscriptionsError;
          
          setSubscriptions(subscriptionsData || []);
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [user, isLoading, router]);
  
  // Show loading state
  if (isLoading || loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Check if user has admin role
  const isAdmin = user?.app_metadata?.role === 'admin';

  return (
    <div className="container py-8">
      <div className="relative py-8 md:py-12 overflow-hidden mb-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 dark:opacity-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-primary blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        </div>
        
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground mb-4">
              My Digital Products
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mb-4"></div>
            <p className="text-muted-foreground">Manage and access your purchased digital marketing resources</p>
          </div>
          
          {isAdmin && (
            <div className="flex space-x-3">
              <Button asChild variant="default" className="h-10">
                <Link href="/dashboard/admin/courses/create">Create Course</Link>
              </Button>
              <Button asChild variant="default" className="h-10">
                <Link href="/dashboard/admin/coaching">Manage Coaching</Link>
              </Button>
              <Button asChild variant="outline" className="h-10">
                <Link href="/dashboard/admin">Admin Dashboard</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Coaching Subscriptions Section */}
      {subscriptions.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Coaching Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="group overflow-hidden border border-border/40 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="p-5">
                  <CardTitle className="text-xl group-hover:text-primary transition-colors">
                    {subscription.plan.service.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {subscription.plan.title}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="px-2 py-1 text-xs rounded-full capitalize bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {subscription.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sessions per month:</span>
                    <span>{subscription.plan.sessions_per_month}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex justify-between">
                  <Button asChild size="sm" variant="outline" className="gap-2 hover:text-accent-foreground">
                    <Link href="/dashboard/sessions">
                      <Calendar className="h-4 w-4" />
                      Manage Sessions
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/build" className="inline-flex items-center gap-2">
                Browse More Coaching Services
              </Link>
            </Button>
          </div>
        </div>
      )}
      
      {/* Digital Products Section */}
      <h2 className="text-2xl font-bold mb-6">My Digital Products</h2>
      {purchases.length === 0 ? (
        <Card className="border border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle>You haven't purchased any products yet.</CardTitle>
            <CardDescription>
              Browse our selection of digital marketing products and courses to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Our products include guides, templates, and tools to help you accelerate your digital marketing efforts.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="w-full sm:w-auto hover:text-primary-foreground">
              <Link href="/products" className="inline-flex items-center gap-2">
                <ShoppingBasket className="h-4 w-4" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto hover:text-accent-foreground">
              <Link href="/courses" className="inline-flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
            {subscriptions.length === 0 && (
              <Button asChild variant="outline" className="w-full sm:w-auto hover:text-accent-foreground">
                <Link href="/build" className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Coaching Services
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="group overflow-hidden border border-border/40 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5">
              {purchase.product.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden">
                  <img 
                    src={purchase.product.imageUrl} 
                    alt={purchase.product.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <CardHeader className="p-5">
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {purchase.product.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {purchase.product.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-0 flex justify-between">
                <Button asChild size="sm" variant="outline" className="gap-2 hover:text-accent-foreground">
                  <a href={purchase.product.pdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    Download PDF
                  </a>
                </Button>
                
                <Button asChild size="sm" variant="ghost" className="gap-1 hover:text-accent-foreground">
                  <Link href={`/products/${purchase.product.id}`}>
                    View Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {purchases.length > 0 && (
        <div className="mt-12 flex justify-center space-x-4">
          <Button asChild variant="outline" className="hover:text-accent-foreground">
            <Link href="/products" className="inline-flex items-center gap-2">
              <ShoppingBasket className="h-4 w-4" />
              Browse More Products
            </Link>
          </Button>
          <Button asChild variant="outline" className="hover:text-accent-foreground">
            <Link href="/courses" className="inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Browse Courses
            </Link>
          </Button>
          {subscriptions.length === 0 && (
            <Button asChild variant="outline" className="hover:text-accent-foreground">
              <Link href="/build" className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Coaching Services
              </Link>
            </Button>
          )}
        </div>
      )}
      
      {subscriptions.length > 0 && (
        <div className="mt-12 flex justify-center space-x-4">
          <Button asChild variant="outline" className="hover:text-accent-foreground">
            <Link href="/dashboard/sessions" className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Manage Coaching Sessions
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
} 