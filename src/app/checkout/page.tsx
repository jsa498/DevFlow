'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { loadStripe } from '@stripe/stripe-js';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import Image from 'next/image';

// Create a separate component that uses the cart state
function CheckoutContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);

    // Redirect to login if not authenticated
    if (mounted && !authLoading && !user) {
      router.push(`/signin?callbackUrl=/checkout`);
    }
  }, [user, authLoading, router, mounted]);

  // Wait for hydration to complete
  if (!mounted) return null;

  // If cart is empty, redirect to products
  if (mounted && items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Your Cart is Empty</CardTitle>
            <CardDescription>
              You don't have any items in your cart yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-center text-muted-foreground mb-8">
              Add some products to your cart to proceed with checkout.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/signin?callbackUrl=/checkout`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400 && data.error === 'All products have already been purchased') {
          toast.error('You have already purchased all these products. Check your dashboard.');
          clearCart(); // Clear the cart since items are already purchased
          router.push('/dashboard');
          return;
        }
        
        if (response.status === 401) {
          toast.error('Please sign in to complete your purchase');
          router.push(`/signin?callbackUrl=/checkout`);
          return;
        }
        
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const { sessionId } = data;
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      if (!stripe) {
        throw new Error('Failed to load payment processor');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      
      // Show a more specific error message if possible
      let errorMessage = 'There was a problem processing your payment. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('payment processor')) {
          errorMessage = 'Could not initialize the payment processor. Please try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPrice = getTotalPrice();

  return (
    <div className="container mx-auto py-16 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>
                Complete your purchase to access the products
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/courses" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Continue Shopping
              </Link>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Order Summary</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center p-4 gap-4">
                      <div className="h-16 w-16 relative bg-muted rounded flex-shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">${item.price.toFixed(2)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id, user?.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                Processing...
              </span>
            ) : (
              `Pay $${totalPrice.toFixed(2)}`
            )}
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            By completing this purchase, you agree to our{' '}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

// Loading fallback component
function CheckoutLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

// Main checkout page component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutContent />
    </Suspense>
  );
} 