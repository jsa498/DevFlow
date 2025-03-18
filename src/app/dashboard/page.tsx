'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, ShoppingBasket, Download, Calendar, Eye } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';
import { Database } from '@/types/supabase';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      router.push('/signin?callbackUrl=/dashboard');
      return;
    }

    const fetchPurchases = async () => {
      try {
        const supabase = createClientComponentClient<Database>();

        // Fetch completed purchases with product and course details
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
              image_url,
              pdf_url,
              course:courses (
                id,
                difficulty_level,
                estimated_duration
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (purchasesError) {
          console.error('Error fetching purchases:', purchasesError);
          toast.error('Failed to load your purchases');
          return;
        }

        setPurchases(purchasesData || []);
      } catch (error) {
        console.error('Error in fetchPurchases:', error);
        toast.error('Failed to load your purchases');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [user, router]);
  
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
      {purchases.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">My Digital Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchases.map((purchase) => {
              const product = purchase.product;
              const isCourse = !!product?.course;
              
              return (
                <Card key={purchase.id} className="group overflow-hidden border border-border/40 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5">
                  <div className="relative h-48 overflow-hidden">
                    {product?.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ShoppingBasket className="h-12 w-12 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                  <CardHeader className="p-5">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {product?.title || "Product"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {product?.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                        {isCourse ? "Course" : "Digital Product"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Purchased:</span>
                      <span>{new Date(purchase.created_at).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-5 pt-0 flex justify-between">
                    {isCourse ? (
                      <Button asChild size="sm" className="gap-2">
                        <Link href={`/courses/${product.id}`}>
                          <BookOpen className="h-4 w-4" />
                          Start Course
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="gap-2">
                        <a href={product.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          Download PDF
                        </a>
                      </Button>
                    )}
                    
                    <Button asChild size="sm" variant="outline" className="gap-2 hover:text-accent-foreground">
                      <Link href={isCourse ? `/courses/${product.id}` : `/products/${product.id}`}>
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4">You haven't purchased any products yet.</h2>
          <p className="text-muted-foreground mb-6">
            Browse our selection of digital marketing products and courses to get started.
          </p>
          <p className="text-muted-foreground mb-8">
            Our products include guides, templates, and tools to help you accelerate your digital marketing efforts.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild>
              <Link href="/products">
                <ShoppingBasket className="mr-2 h-4 w-4" />
                Browse Products
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/courses">
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Courses
              </Link>
            </Button>
          </div>
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