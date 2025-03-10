'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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

export default function CoachingCalendarPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchCoachingSessions();
    }
  }, [user, authLoading, isAdmin, router, currentDate]);
  
  const fetchCoachingSessions = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Get the first and last day of the current month
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      
      // Fetch coaching sessions for the current month
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('coaching_sessions')
        .select(`
          *,
          user:user_id (
            email,
            full_name
          )
        `)
        .gte('scheduled_at', firstDay.toISOString())
        .lte('scheduled_at', lastDay.toISOString())
        .order('scheduled_at', { ascending: true });
        
      if (sessionsError) {
        console.error('Error fetching coaching sessions:', sessionsError);
        toast.error('Failed to load coaching sessions');
        setSessions([]);
      } else {
        setSessions(sessionsData || []);
      }
    } catch (error) {
      console.error('Error in fetchCoachingSessions:', error);
      toast.error('Failed to load coaching sessions');
      setSessions([]);
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
  
  // Calendar navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };
  
  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Calculate how many days from the previous month we need to show
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to show (previous month days + current month days)
    const totalDays = daysFromPrevMonth + lastDay.getDate();
    
    // Calculate how many weeks we need (ceil to account for partial weeks)
    const totalWeeks = Math.ceil(totalDays / 7);
    
    // Generate calendar days
    const days = [];
    let dayCounter = 1 - daysFromPrevMonth;
    
    for (let i = 0; i < totalWeeks * 7; i++) {
      const currentDay = new Date(year, month, dayCounter);
      const isCurrentMonth = currentDay.getMonth() === month;
      const isToday = new Date().toDateString() === currentDay.toDateString();
      
      // Get sessions for this day
      const daysSessions = sessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at);
        return sessionDate.toDateString() === currentDay.toDateString();
      });
      
      days.push({
        date: currentDay,
        isCurrentMonth,
        isToday,
        sessions: daysSessions
      });
      
      dayCounter++;
    }
    
    return days;
  };
  
  const calendarDays = generateCalendarDays();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/admin/coaching" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Coaching Management
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Coaching Calendar</h1>
          <p className="text-muted-foreground mt-1">View and manage coaching sessions by date</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/coaching/sessions/create" className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Session
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{formatDate(currentDate)}</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="text-foreground">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday} className="text-foreground">
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth} className="text-foreground">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {/* Weekday headers */}
            {weekdays.map((day, index) => (
              <div key={index} className="text-center py-2 font-medium text-sm">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((day, index) => (
              <div 
                key={index} 
                className={`
                  min-h-[100px] border p-1 relative
                  ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                  ${day.isToday ? 'border-primary' : 'border-border'}
                `}
              >
                <div className="text-right text-sm p-1">
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1 mt-1">
                  {day.sessions.slice(0, 3).map((session) => (
                    <Link 
                      key={session.id} 
                      href={`/dashboard/admin/coaching/sessions/${session.id}`}
                      className="block"
                    >
                      <div 
                        className={`
                          text-xs p-1 rounded truncate
                          ${session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                            session.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            session.status === 'canceled' ? 'bg-red-100 text-red-800' : 
                            'bg-gray-100 text-gray-800'}
                        `}
                      >
                        {new Date(session.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {session.user?.full_name || session.user?.email || 'Unknown'}
                      </div>
                    </Link>
                  ))}
                  
                  {day.sessions.length > 3 && (
                    <div className="text-xs text-center text-muted-foreground">
                      +{day.sessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 