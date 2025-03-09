import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import type { CartItem, CartItemInsert } from '@/lib/supabase/client';

export interface LocalCartItem {
  id: string;
  title: string;
  price: number;
  imageUrl?: string | null;
}

interface CartStore {
  items: LocalCartItem[];
  initialized: boolean;
  subscription: ReturnType<typeof supabase.channel> | null;
  addItem: (item: LocalCartItem, userId?: string) => Promise<void>;
  removeItem: (id: string, userId?: string) => Promise<void>;
  clearCart: (userId?: string) => Promise<void>;
  getItemCount: () => number;
  getTotalPrice: () => number;
  isItemInCart: (id: string) => boolean;
  syncWithSupabase: (userId: string) => Promise<void>;
  cleanup: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      initialized: false,
      subscription: null,

      addItem: async (item, userId) => {
        const { items } = get();
        const existingItem = items.find(i => i.id === item.id);
        
        if (!existingItem) {
          // Update local state
          set({ items: [...items, item] });
          
          // If user is logged in, sync with Supabase
          if (userId) {
            try {
              const cartItem: CartItemInsert = {
                user_id: userId,
                product_id: item.id,
                title: item.title,
                price: item.price,
                image_url: item.imageUrl
              };
              
              await supabase.from('cart_items').insert(cartItem);
            } catch (error) {
              console.error('Error syncing cart item to Supabase:', error);
            }
          }
        }
      },
      
      removeItem: async (id, userId) => {
        const { items } = get();
        
        // Update local state
        set({ items: items.filter(item => item.id !== id) });
        
        // If user is logged in, remove from Supabase
        if (userId) {
          try {
            await supabase
              .from('cart_items')
              .delete()
              .match({ user_id: userId, product_id: id });
          } catch (error) {
            console.error('Error removing cart item from Supabase:', error);
          }
        }
      },
      
      clearCart: async (userId) => {
        // Clear local state
        set({ items: [] });
        
        // If user is logged in, clear from Supabase
        if (userId) {
          try {
            await supabase
              .from('cart_items')
              .delete()
              .match({ user_id: userId });
          } catch (error) {
            console.error('Error clearing cart from Supabase:', error);
          }
        }
      },
      
      getItemCount: () => {
        return get().items.length;
      },
      
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price, 0);
      },
      
      isItemInCart: (id) => {
        return get().items.some(item => item.id === id);
      },

      syncWithSupabase: async (userId) => {
        try {
          // First, cleanup any existing subscription
          const { subscription } = get();
          if (subscription) {
            subscription.unsubscribe();
          }

          // Fetch existing cart items
          const { data: cartItems, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', userId);

          if (error) throw error;

          // Convert to local format
          const localItems: LocalCartItem[] = cartItems.map(item => ({
            id: item.product_id,
            title: item.title,
            price: item.price,
            imageUrl: item.image_url
          }));

          // Update local state
          set({ items: localItems, initialized: true });

          // Set up real-time subscription
          const channelId = `cart:${userId}`;
          const newSubscription = supabase
            .channel(channelId)
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'cart_items',
                filter: `user_id=eq.${userId}`
              },
              async (payload) => {
                console.log('Received real-time update:', payload);
                
                // Refetch all cart items to ensure consistency
                const { data: updatedItems, error: refetchError } = await supabase
                  .from('cart_items')
                  .select('*')
                  .eq('user_id', userId);

                if (refetchError) {
                  console.error('Error refetching cart items:', refetchError);
                  return;
                }

                if (updatedItems) {
                  const localUpdatedItems = updatedItems.map(item => ({
                    id: item.product_id,
                    title: item.title,
                    price: item.price,
                    imageUrl: item.image_url
                  }));
                  
                  console.log('Updating local cart state:', localUpdatedItems);
                  set({ items: localUpdatedItems });
                }
              }
            )
            .subscribe((status) => {
              console.log(`Supabase real-time subscription status: ${status}`);
            });

          set({ subscription: newSubscription });
        } catch (error) {
          console.error('Error syncing with Supabase:', error);
          // Reset initialized state on error
          set({ initialized: false });
        }
      },

      cleanup: () => {
        const { subscription } = get();
        if (subscription) {
          subscription.unsubscribe();
          set({ subscription: null, initialized: false });
        }
      }
    }),
    {
      name: 'shopping-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: false,
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialized = false; // Reset initialized state on rehydration
        }
      },
    }
  )
); 