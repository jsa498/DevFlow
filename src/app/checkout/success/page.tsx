'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [redirecting, setRedirecting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    if (sessionId) {
      console.log('Checkout successful with session ID:', sessionId);
      
      // Clear the cart
      clearCart();
      
      // Set a timer to redirect to dashboard after 5 seconds
      // This gives the webhook time to process the purchase
      toast.success('Purchase successful! Redirecting to your dashboard...');
      
      setRedirecting(true);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push('/dashboard');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      // If no session ID, redirect to home
      router.push('/');
    }
  }, [sessionId, clearCart, router]);
  
  // Extract order ID from session ID (first 8 characters)
  const orderId = sessionId ? sessionId.substring(0, 8).toUpperCase() : '';
  
  return (
    <div className="container max-w-4xl py-12">
      <Card className="border-2 border-green-500/20 dark:border-green-500/10 shadow-lg shadow-green-500/5">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400">
            Payment Successful!
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Thank you for your purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4 pb-2">
          <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-medium mb-2">Order Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground text-left">Order ID:</span>
              <span className="font-mono text-right">{orderId}</span>
              <span className="text-muted-foreground text-left">Status:</span>
              <span className="text-right text-green-600 dark:text-green-400">Completed</span>
            </div>
          </div>
          
          <p className="text-muted-foreground">
            We've sent a confirmation email with your order details.
          </p>
          
          {redirecting && (
            <div className="bg-primary/10 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-primary font-medium">
                Redirecting to your dashboard in {countdown} seconds...
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Button 
            asChild 
            className="w-full sm:w-auto" 
            disabled={redirecting}
          >
            <Link href="/dashboard">
              Go to My Dashboard
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline" 
            className="w-full sm:w-auto"
            disabled={redirecting}
          >
            <Link href="/products">
              Browse More Products
            </Link>
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">
          If you have any questions about your order, please contact our customer support.
        </p>
      </div>
    </div>
  );
} 