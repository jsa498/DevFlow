'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Calendar, Check, Clock, Edit, ExternalLink, Loader2, Video, X } from 'lucide-react';
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
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name?: string;
    };
  };
};

export default function AdminSessionsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchSessions();
    }
  }, [user, authLoading, isAdmin, router]);
  
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Get all coaching sessions with user details
      const { data, error } = await supabase
        .from('coaching_sessions')
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .order('scheduled_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching coaching sessions:', error);
        toast.error('Failed to load coaching sessions');
        setSessions([]);
      } else {
        setSessions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSessions:', error);
      toast.error('Failed to load coaching sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditSession = (session: CoachingSession) => {
    setEditingSession(session.id);
    setMeetingUrl(session.meeting_url || '');
    setSessionNotes(session.notes || '');
  };
  
  const handleCancelEdit = () => {
    setEditingSession(null);
    setMeetingUrl('');
    setSessionNotes('');
  };
  
  const handleSaveSession = async (sessionId: string) => {
    try {
      setIsSubmitting(true);
      const supabase = createClientComponentClient();
      
      // Update the session
      const { error } = await supabase
        .from('coaching_sessions')
        .update({
          meeting_url: meetingUrl || null,
          notes: sessionNotes || null,
        })
        .eq('id', sessionId);
        
      if (error) {
        throw new Error(`Failed to update session: ${error.message}`);
      }
      
      // Update the local state
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, meeting_url: meetingUrl || null, notes: sessionNotes || null } 
          : session
      ));
      
      toast.success('Session updated successfully');
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update session');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUpdateStatus = async (sessionId: string, newStatus: 'scheduled' | 'completed' | 'canceled' | 'no_show') => {
    try {
      const supabase = createClientComponentClient();
      
      // Update the session status
      const { error } = await supabase
        .from('coaching_sessions')
        .update({ status: newStatus })
        .eq('id', sessionId);
        
      if (error) {
        throw new Error(`Failed to update session status: ${error.message}`);
      }
      
      // Update the local state
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, status: newStatus } 
          : session
      ));
      
      toast.success(`Session marked as ${newStatus}`);
    } catch (error) {
      console.error('Error updating session status:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update session status');
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
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/admin/coaching" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Coaching Management
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Coaching Sessions</h1>
          <p className="text-muted-foreground mt-1">Manage all coaching sessions</p>
        </div>
      </div>
      
      {sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Coaching Sessions Found</CardTitle>
            <CardDescription>
              There are no coaching sessions scheduled yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
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
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>Client: {session.user.user_metadata?.full_name || session.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                  </div>
                  
                  {editingSession === session.id ? (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <div>
                        <Label htmlFor={`meeting-url-${session.id}`}>Meeting URL</Label>
                        <Input
                          id={`meeting-url-${session.id}`}
                          value={meetingUrl}
                          onChange={(e) => setMeetingUrl(e.target.value)}
                          placeholder="https://zoom.us/j/123456789"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`notes-${session.id}`}>Session Notes</Label>
                        <Textarea
                          id={`notes-${session.id}`}
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                          placeholder="Add notes about the session..."
                          className="mt-1 min-h-32"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleSaveSession(session.id)}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {session.status === 'scheduled' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditSession(session)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Session
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(session.id, 'completed')}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark Completed
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateStatus(session.id, 'no_show')}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Mark No-Show
                          </Button>
                        </>
                      )}
                      
                      {session.meeting_url && (
                        <Button asChild variant="default" size="sm">
                          <a href={session.meeting_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Join Meeting
                          </a>
                        </Button>
                      )}
                      
                      {session.status !== 'scheduled' && session.status !== 'canceled' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditSession(session)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {session.notes ? 'Edit Notes' : 'Add Notes'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 