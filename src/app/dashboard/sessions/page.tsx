'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, ExternalLink, Video } from 'lucide-react';
import { toast } from 'sonner';

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
};

type UserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  plan: {
    id: string;
    title: string;
    sessions_per_month: number;
    service: {
      id: string;
      title: string;
    };
  };
};

export default function CoachingSessionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    // Redirect to sign in if not authenticated
    if (!authLoading && !user) {
      router.push('/signin?callbackUrl=/dashboard/sessions');
      return;
    }
    
    if (user) {
      fetchUserData();
    }
  }, [user, authLoading, router]);
  
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Fetch user's coaching sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('coaching_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('scheduled_at', { ascending: true });
        
      if (sessionsError) {
        console.error('Error fetching coaching sessions:', sessionsError);
        toast.error('Failed to load coaching sessions');
        setSessions([]);
      } else {
        setSessions(sessionsData || []);
      }
      
      // Fetch user's subscriptions with plan details
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:coaching_subscription_plans (
            id,
            title,
            sessions_per_month,
            service:coaching_services (
              id,
              title
            )
          )
        `)
        .eq('user_id', user?.id)
        .in('status', ['active', 'trialing'])
        .order('created_at', { ascending: false });
        
      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
        toast.error('Failed to load subscriptions');
        setSubscriptions([]);
      } else {
        setSubscriptions(subscriptionsData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancelSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to cancel this coaching session?')) {
      return;
    }
    
    try {
      const supabase = createClientComponentClient();
      
      const { error } = await supabase
        .from('coaching_sessions')
        .update({ status: 'canceled' })
        .eq('id', sessionId)
        .eq('user_id', user?.id);
        
      if (error) {
        console.error('Error canceling session:', error);
        toast.error('Failed to cancel session');
      } else {
        toast.success('Session canceled successfully');
        
        // Update local state
        setSessions(sessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'canceled' } 
            : session
        ));
      }
    } catch (error) {
      console.error('Error canceling session:', error);
      toast.error('Failed to cancel session');
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'no_show':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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
  
  return (
    <div className="container py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>
      
      <div className="relative py-8 md:py-12 overflow-hidden mb-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 dark:opacity-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-primary blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground mb-4">
            My Coaching Sessions
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mb-4"></div>
          <p className="text-muted-foreground max-w-3xl">
            Manage your coaching sessions and subscriptions. Schedule new sessions, view upcoming appointments, and access meeting links.
          </p>
          
          {isAdmin && (
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin/coaching">
                  Manage Coaching Services
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {subscriptions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">My Subscriptions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <Card key={subscription.id} className="border border-border/40 shadow-lg">
                <CardHeader>
                  <CardTitle>{subscription.plan.title}</CardTitle>
                  <CardDescription>
                    {subscription.plan.service.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="px-2 py-1 text-xs rounded-full capitalize bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        {subscription.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sessions per month:</span>
                      <span>{subscription.plan.sessions_per_month}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current period:</span>
                      <span>{new Date(subscription.current_period_start).toLocaleDateString()} - {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href="/dashboard/sessions/schedule">
                      Schedule a Session
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Upcoming & Past Sessions</h2>
        
        {sessions.length === 0 ? (
          <Card className="border border-border/40 shadow-lg">
            <CardHeader>
              <CardTitle>No Coaching Sessions</CardTitle>
              <CardDescription>
                You don't have any coaching sessions scheduled yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {subscriptions.length > 0 
                  ? 'You have an active subscription. Schedule your first coaching session now!'
                  : 'Subscribe to a coaching plan or book an initial consultation to get started.'}
              </p>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              {subscriptions.length > 0 ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard/sessions/schedule">
                    Schedule a Session
                  </Link>
                </Button>
              ) : (
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/build">
                    Browse Coaching Services
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="border border-border/40 shadow-lg">
                <div className="md:flex">
                  <div className="md:w-1/4 bg-muted p-6 flex flex-col justify-center items-center">
                    <div className="text-center">
                      <div className="text-lg font-semibold">{formatDate(session.scheduled_at)}</div>
                      <div className="text-2xl font-bold mt-1">{formatTime(session.scheduled_at)}</div>
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusBadgeClass(session.status)}`}>
                          {session.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 md:w-3/4">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold">{session.title}</h3>
                      {session.description && (
                        <p className="text-muted-foreground mt-1">{session.description}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>{session.duration_minutes} minutes</span>
                      </div>
                      {session.meeting_url && (
                        <div className="flex items-center gap-2">
                          <Video className="h-5 w-5 text-primary" />
                          <span>Video meeting available</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {session.meeting_url && session.status === 'scheduled' && (
                        <Button asChild variant="default" size="sm">
                          <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                      
                      {session.status === 'scheduled' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelSession(session.id)}
                        >
                          Cancel Session
                        </Button>
                      )}
                      
                      {session.notes && session.status === 'completed' && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/sessions/${session.id}`}>
                            View Session Notes
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        {subscriptions.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link href="/dashboard/sessions/schedule">
                Schedule a New Session
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 