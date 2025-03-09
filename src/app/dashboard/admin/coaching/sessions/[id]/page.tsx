'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, User, Link as LinkIcon, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

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

export default function SessionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [session, setSession] = useState<CoachingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'scheduled' | 'completed' | 'canceled' | 'no_show'>('scheduled');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin && params.id) {
      fetchSessionDetails();
    }
  }, [user, authLoading, isAdmin, router, params.id]);
  
  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Fetch session details
      const { data, error } = await supabase
        .from('coaching_sessions')
        .select(`
          *,
          user:user_id (
            email,
            full_name
          )
        `)
        .eq('id', params.id)
        .single();
        
      if (error) {
        console.error('Error fetching session details:', error);
        toast.error('Failed to load session details');
        setSession(null);
      } else if (data) {
        setSession(data);
        setNotes(data.notes || '');
        setStatus(data.status);
        setMeetingUrl(data.meeting_url || '');
      }
    } catch (error) {
      console.error('Error in fetchSessionDetails:', error);
      toast.error('Failed to load session details');
      setSession(null);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateSession = async () => {
    try {
      if (!session) return;
      
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Update session
      const { error } = await supabase
        .from('coaching_sessions')
        .update({
          notes,
          status,
          meeting_url: meetingUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);
        
      if (error) {
        console.error('Error updating session:', error);
        toast.error('Failed to update session');
      } else {
        toast.success('Session updated successfully');
        setSession({
          ...session,
          notes,
          status,
          meeting_url: meetingUrl || null,
          updated_at: new Date().toISOString()
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating session:', error);
      toast.error('Failed to update session');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSession = async () => {
    try {
      if (!session) return;
      
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Delete session
      const { error } = await supabase
        .from('coaching_sessions')
        .delete()
        .eq('id', session.id);
        
      if (error) {
        console.error('Error deleting session:', error);
        toast.error('Failed to delete session');
      } else {
        toast.success('Session deleted successfully');
        router.push('/dashboard/admin/coaching/calendar');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
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
  
  if (!session) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Session Not Found</CardTitle>
            <CardDescription>
              The requested coaching session could not be found.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/dashboard/admin/coaching/calendar">
                Back to Calendar
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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
            <Link href="/dashboard/admin/coaching/calendar" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Calendar
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{session.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge 
              variant={
                session.status === 'scheduled' ? 'default' :
                session.status === 'completed' ? 'secondary' :
                session.status === 'canceled' ? 'destructive' : 'outline'
              }
            >
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="h-4 w-4 mr-2" /> {isEditing ? 'Cancel Editing' : 'Edit Session'}
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> Delete Session
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{session.user?.full_name || session.user?.email || 'Unknown User'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <Badge 
                        variant={
                          session.status === 'scheduled' ? 'default' :
                          session.status === 'completed' ? 'secondary' :
                          session.status === 'canceled' ? 'destructive' : 'outline'
                        }
                      >
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(session.scheduled_at)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{session.duration_minutes} minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  {session.meeting_url && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Meeting Link</h3>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={session.meeting_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {session.meeting_url}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {session.description && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                      <p className="text-sm">{session.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Notes</h3>
                    <p className="text-sm whitespace-pre-line">{session.notes || 'No notes added yet.'}</p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={status} 
                      onValueChange={(value) => setStatus(value as any)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="no_show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="meeting-url">Meeting URL</Label>
                    <Input 
                      id="meeting-url"
                      value={meetingUrl}
                      onChange={(e) => setMeetingUrl(e.target.value)}
                      placeholder="https://zoom.us/j/123456789"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Session Notes</Label>
                    <Textarea 
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about the session..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateSession}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Name</h3>
                <p>{session.user?.full_name || 'Not provided'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                <p>{session.user?.email || 'Unknown'}</p>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/dashboard/admin/users/${session.user_id}`}>
                    View Client Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this coaching session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSession}>
              Delete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 