'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const router = useRouter();
  
  // Clear the cart on successful checkout
  useEffect(() => {
    if (sessionId) {
      clearCart();
    } else {
      // If no session ID is present, redirect to home
      router.push('/');
    }
  }, [sessionId, clearCart, router]);

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            Thank you for your purchase. Your order has been processed successfully, and you now have access to your digital products.
          </p>
          
          <div className="bg-accent/40 w-full p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">Digital Marketing Resource</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium text-xs">#{sessionId?.slice(-8).toUpperCase() || '00000000'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-green-500">Completed</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button asChild className="flex-1">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/courses">Browse More Products</Link>
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-8">
            A confirmation email has been sent to your email address.
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
} 