'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

type CoachingSession = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  title: string;
  description: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'canceled' | 'no_show';
  notes: string | null;
  meeting_url: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
};

type UserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string | null;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
    full_name: string | null;
  };
  plan?: {
    title: string;
    sessions_per_month: number;
  };
};

export default function CoachingManagementPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'subscriptions'>('sessions');
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchCoachingData();
    }
  }, [user, authLoading, isAdmin, router]);
  
  const fetchCoachingData = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Fetch coaching sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('coaching_sessions')
        .select(`
          *,
          user:user_id (
            email,
            full_name
          )
        `)
        .order('scheduled_at', { ascending: false });
        
      if (sessionsError) {
        console.error('Error fetching coaching sessions:', sessionsError);
        toast.error('Failed to load coaching sessions');
        setSessions([]);
      } else {
        setSessions(sessionsData || []);
      }
      
      // Fetch user subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          user:user_id (
            email,
            full_name
          ),
          plan:plan_id (
            title,
            sessions_per_month
          )
        `)
        .order('created_at', { ascending: false });
        
      if (subscriptionsError) {
        console.error('Error fetching user subscriptions:', subscriptionsError);
        toast.error('Failed to load user subscriptions');
        setSubscriptions([]);
      } else {
        setSubscriptions(subscriptionsData || []);
      }
    } catch (error) {
      console.error('Error in fetchCoachingData:', error);
      toast.error('Failed to load coaching data');
      setSessions([]);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state
  if (loading || authLoading) {
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
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Coaching Management</h1>
          <p className="text-muted-foreground mt-1">Manage coaching sessions and user subscriptions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={activeTab === 'sessions' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('sessions')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" /> Sessions
          </Button>
          <Button 
            variant={activeTab === 'subscriptions' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('subscriptions')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" /> Subscriptions
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/coaching/calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Calendar View
            </Link>
          </Button>
        </div>
      </div>
      
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <CardTitle>Coaching Sessions</CardTitle>
            <CardDescription>
              View and manage all coaching sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No coaching sessions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Client</th>
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Scheduled At</th>
                      <th className="text-left py-3 px-4">Duration</th>
                      <th className="text-left py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {session.user?.full_name || session.user?.email || 'Unknown User'}
                        </td>
                        <td className="py-3 px-4">{session.title}</td>
                        <td className="py-3 px-4">{formatDate(session.scheduled_at)}</td>
                        <td className="py-3 px-4">{session.duration_minutes} minutes</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              session.status === 'scheduled' ? 'default' :
                              session.status === 'completed' ? 'secondary' :
                              session.status === 'canceled' ? 'destructive' : 'outline'
                            }
                          >
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {activeTab === 'subscriptions' && (
        <Card>
          <CardHeader>
            <CardTitle>User Subscriptions</CardTitle>
            <CardDescription>
              View and manage all user subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user subscriptions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Plan</th>
                      <th className="text-left py-3 px-4">Sessions/Month</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Current Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          {subscription.user?.full_name || subscription.user?.email || 'Unknown User'}
                        </td>
                        <td className="py-3 px-4">{subscription.plan?.title || 'Unknown Plan'}</td>
                        <td className="py-3 px-4">{subscription.plan?.sessions_per_month || 'N/A'}</td>
                        <td className="py-3 px-4">
                          <Badge 
                            variant={
                              subscription.status === 'active' ? 'secondary' :
                              subscription.status === 'canceled' ? 'destructive' :
                              subscription.status === 'past_due' ? 'default' : 'outline'
                            }
                          >
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 