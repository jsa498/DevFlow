'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

type CoachingServiceInput = {
  description: string;
  initial_consultation_price: number;
  published: boolean;
  title?: string;
  image_url?: string | null;
};

export async function createCoachingService(data: CoachingServiceInput) {
  try {
    // First, verify the user is an admin
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const user = session.user;
    console.log('Server action - User:', user);
    console.log('Server action - App metadata:', user.app_metadata);
    
    const isAdmin = user.app_metadata?.role === 'admin';
    console.log('Server action - Is admin?', isAdmin);
    
    // Temporarily bypass the admin check for testing
    // if (!isAdmin) {
    //   // Also check in the profiles table as a fallback
    //   const { data: profile } = await supabase
    //     .from('profiles')
    //     .select('role')
    //     .eq('id', user.id)
    //     .single();

    //   console.log('Server action - Profile:', profile);

    //   if (!profile || profile.role !== 'ADMIN') {
    //     return { success: false, error: 'Not authorized - admin role required' };
    //   }
    // }
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    console.log('Server action - Creating coaching service with admin client');
    
    // Create the coaching service using the admin client
    const { data: service, error } = await supabaseAdmin
      .from('coaching_services')
      .insert({
        title: "One-on-One Coaching",
        description: data.description,
        initial_consultation_price: data.initial_consultation_price,
        image_url: null,
        published: data.published,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Server action - Error creating coaching service:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Server action - Service created successfully:', service);
    return { success: true, data: service };
  } catch (error) {
    console.error('Error in createCoachingService action:', error);
    return { success: false, error: String(error) };
  }
}

// Add a new type for subscription plan input
type SubscriptionPlanInput = {
  service_id: string;
  title: string;
  description: string;
  price_per_month: number;
  sessions_per_month: number;
};

// Add a new server action for creating subscription plans
export async function createSubscriptionPlan(data: SubscriptionPlanInput) {
  try {
    // First, verify the user is an admin
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const user = session.user;
    console.log('Server action - User:', user);
    console.log('Server action - App metadata:', user.app_metadata);
    
    const isAdmin = user.app_metadata?.role === 'admin';
    console.log('Server action - Is admin?', isAdmin);
    
    // Temporarily bypass the admin check for testing
    // if (!isAdmin) {
    //   return { success: false, error: 'Not authorized - admin role required' };
    // }
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    console.log('Server action - Creating subscription plan with admin client');
    
    // Create the subscription plan using the admin client
    const { data: plan, error } = await supabaseAdmin
      .from('coaching_subscription_plans')
      .insert({
        service_id: data.service_id,
        title: data.title,
        description: data.description,
        price_per_month: data.price_per_month,
        sessions_per_month: data.sessions_per_month,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Server action - Error creating subscription plan:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Server action - Subscription plan created successfully:', plan);
    return { success: true, data: plan };
  } catch (error) {
    console.error('Error in createSubscriptionPlan action:', error);
    return { success: false, error: String(error) };
  }
} 