'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { loadStripe } from '@stripe/stripe-js';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { ArrowLeft, Bookmark, Check, ShoppingCart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

async function getProduct(id: string) {
  const res = await fetch(`/api/products/${id}`);
  if (!res.ok) {
    throw new Error('Failed to fetch product');
  }
  return res.json();
}

async function checkPurchaseStatus(id: string) {
  const res = await fetch(`/api/products/${id}/check-purchase`);
  if (!res.ok) {
    return { purchased: false };
  }
  const data = await res.json();
  return { purchased: data.purchased };
}

export default function CoursePage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchased, setPurchased] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addItem, isItemInCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const productData = await getProduct(courseId);
        setProduct(productData);
        
        // Check if user has purchased this product
        if (user) {
          const { purchased } = await checkPurchaseStatus(courseId);
          setPurchased(purchased);
          console.log(`Purchase status for course ${courseId}:`, purchased);
        }
      } catch (err) {
        setError("Failed to load course. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProduct();
  }, [courseId, user]);

  const handleCheckout = async () => {
    if (!user) {
      router.push(`/signin?callbackUrl=/courses/${courseId}`);
      return;
    }
    
    // Check if already purchased before proceeding
    const { purchased: alreadyPurchased } = await checkPurchaseStatus(courseId);
    if (alreadyPurchased) {
      toast.info("You've already purchased this course");
      router.push('/dashboard');
      return;
    }
    
    try {
      setCheckoutLoading(true);
      
      // Add the item to the cart first, so if the user returns without completing checkout,
      // the item will still be in their cart
      if (product && !isItemInCart(product.id)) {
        addItem({
          id: product.id,
          title: product.title,
          price: product.price,
          image_url: product.image_url,
        }, user?.id);
      }
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: [{ id: courseId }],
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }
      
      const data = await response.json();
      
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load payment processor');
      }
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error during checkout:', err);
      toast.error(err instanceof Error ? err.message : 'There was a problem processing your payment. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };
  
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Check if already purchased before adding to cart
    if (user) {
      const { purchased: alreadyPurchased } = await checkPurchaseStatus(courseId);
      if (alreadyPurchased) {
        toast.info("You've already purchased this course");
        router.push('/dashboard');
        return;
      }
    }
    
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image_url: product.image_url,
    }, user?.id);
    
    toast.success('Added to cart');
  };
  
  const isInCart = mounted && product ? isItemInCart(product.id) : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="rounded-full bg-muted h-16 w-16"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
          <div className="h-2 bg-muted rounded w-48"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="text-muted-foreground mb-6">{error || "Course not found. It may have been removed or is no longer available."}</p>
          <Link href="/courses" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link href="/courses" className="inline-flex items-center gap-2 text-primary hover:underline font-medium mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Bookmark className="h-24 w-24 text-muted-foreground/40" />
              </div>
            )}
          </div>
          
          <div className="w-full">
            <div className="mb-4">
              <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">${product.price.toFixed(2)}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>
            <div className="border-t border-border my-6"></div>
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none mb-6">
              <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              {purchased ? (
                <>
                  <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-6 py-3 rounded-full text-sm font-medium">
                    <Check className="h-5 w-5" /> Already Purchased
                  </div>
                  <Link 
                    href={`/dashboard`}
                    className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full hover:bg-primary/90 transition-colors"
                  >
                    View in Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <RainbowButton
                    className="flex-1"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    forceWhiteText={true}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full"></span>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-white">
                        <ShoppingCart className="h-5 w-5" /> Purchase Now
                      </span>
                    )}
                  </RainbowButton>
                  <Button 
                    variant="outline"
                    className="flex-1 inline-flex items-center justify-center gap-2 hover:bg-muted/80 text-foreground px-6 py-3 rounded-full transition-colors"
                    onClick={handleAddToCart}
                    disabled={isInCart}
                  >
                    {isInCart ? (
                      <span className="flex items-center gap-2">
                        <Check className="h-5 w-5" /> Added to Cart
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> Add to Cart
                      </span>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* What you'll get section */}
      <div className="container mx-auto px-4 mt-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">What You'll Get</h2>
          
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12H15M12 9V15M7.8 21H16.2C17.8802 21 18.7202 21 19.362 20.673C19.9265 20.3854 20.3854 19.9265 20.673 19.362C21 18.7202 21 17.8802 21 16.2V7.8C21 6.11984 21 5.27976 20.673 4.63803C20.3854 4.07354 19.9265 3.6146 19.362 3.32698C18.7202 3 17.8802 3 16.2 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Full Lifetime Access</h3>
                  <p className="text-muted-foreground text-sm">Purchase once and get access to all future updates</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 6.05334V19.1973M12 6.05334C10.6615 5.5751 9.22143 5.32412 7.74847 5.32412C6.27551 5.32412 4.83538 5.5751 3.49695 6.05334V19.1973C4.83538 18.7191 6.27551 18.4681 7.74847 18.4681C9.22143 18.4681 10.6615 18.7191 12 19.1973M12 6.05334C13.3385 5.5751 14.7786 5.32412 16.2515 5.32412C17.7245 5.32412 19.1646 5.5751 20.503 6.05334V19.1973C19.1646 18.7191 17.7245 18.4681 16.2515 18.4681C14.7786 18.4681 13.3385 18.7191 12 19.1973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Comprehensive Materials</h3>
                  <p className="text-muted-foreground text-sm">Access to all course materials and resources</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 