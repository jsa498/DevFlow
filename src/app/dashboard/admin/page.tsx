'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { StatsCards } from '@/components/admin/stats-cards';
import { RecentPurchases } from '@/components/admin/recent-purchases';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isLoading, isAdmin, router]);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Approach 1: Try to get users from auth.users via our API endpoint
      try {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            console.log('Users fetched from API:', data.length);
            setUsers(data);
          }
        } else {
          throw new Error('Failed to fetch users from API');
        }
      } catch (authError) {
        console.error('Error fetching users from API:', authError);
        
        // Approach 2: Fallback to getting users directly from profiles table
        console.log('Falling back to profiles table');
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, email, created_at');
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          
          // Approach 3: Last resort - just use the current user
          console.log('Using current user as fallback');
          if (user) {
            setUsers([{
              id: user.id,
              full_name: user.user_metadata?.full_name || 'Anonymous',
              email: user.email || '',
              created_at: new Date().toISOString()
            }]);
          } else {
            setUsers([]);
          }
        } else {
          console.log('Users fetched from profiles:', profilesData?.length);
          setUsers(profilesData || []);
        }
      }
      
      // Get all completed purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
        
      if (purchasesError) {
        console.error('Error fetching purchases:', purchasesError);
        setPurchases([]);
      } else {
        console.log('Purchases fetched:', purchasesData?.length);
        setPurchases(purchasesData || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setUsers([]);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };
  
  if (isLoading || loading) {
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
  
  const totalUsers = users.length;
  const totalRevenue = purchases.reduce((acc, purchase) => acc + purchase.amount, 0);
  const totalPurchases = purchases.length;
  
  return (
    <div className="container py-8 space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <StatsCards
        totalUsers={totalUsers}
        totalRevenue={totalRevenue}
        totalPurchases={totalPurchases}
        users={users}
        purchases={purchases}
      />
      
      <RecentPurchases purchases={purchases.slice(0, 10)} />
    </div>
  );
} 