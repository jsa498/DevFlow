'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContentWithoutClose,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCartStore } from '@/lib/store/cart-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function CartModal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useSupabaseAuth();
  const { items, removeItem, getItemCount, getTotalPrice, clearCart } = useCartStore();
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const itemCount = getItemCount();
  const totalPrice = getTotalPrice();
  
  return (
    <div>
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-9 h-9 bg-transparent hover:bg-transparent transition-colors relative"
        aria-label="Shopping cart"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-[1.2rem] w-[1.2rem] stroke-foreground" />
        {itemCount > 0 && (
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
            {itemCount}
          </Badge>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContentWithoutClose className="sm:max-w-md w-[95vw] p-0">
          <DialogHeader className="p-6 pb-2">
            <div className="flex justify-between items-center gap-4">
              <DialogTitle className="text-xl">Shopping Cart</DialogTitle>
              <div className="flex items-center gap-3">
                {itemCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => clearCart(user?.id)}
                    className="h-9 px-4 text-sm hover:bg-destructive/10 hover:text-destructive"
                  >
                    Clear All
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-9 w-9 rounded-full hover:bg-muted"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                  >
                    <path
                      d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {itemCount === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Your cart is empty
            </div>
          ) : (
            <>
              <ScrollArea className="max-h-[min(70vh,400px)] overflow-auto px-6">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4 py-4">
                      <div className="flex-shrink-0 h-16 w-16 relative bg-muted rounded-lg overflow-hidden">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title} 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-grow min-w-0 pr-2">
                        <span className="font-medium line-clamp-2 leading-tight">{item.title}</span>
                        <span className="text-muted-foreground text-sm mt-1">${item.price.toFixed(2)}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => removeItem(item.id, user?.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="border-t p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
                </div>
                <Button 
                  className="w-full h-11 text-base" 
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/checkout');
                  }}
                >
                  Checkout
                </Button>
              </div>
            </>
          )}
        </DialogContentWithoutClose>
      </Dialog>
    </div>
  );
} 