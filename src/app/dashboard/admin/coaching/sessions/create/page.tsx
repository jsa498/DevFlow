'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { PRICING_TIERS } from '@/lib/pricing-tiers';

type User = {
  id: string;
  email: string;
  full_name: string | null;
};

type UserSubscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  sessions_remaining: number;
};

export default function CreateSessionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<UserSubscription[]>([]);
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');
  const [title, setTitle] = useState('Coaching Session');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [meetingUrl, setMeetingUrl] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchUsers();
      fetchSubscriptions();
    }
  }, [user, authLoading, isAdmin, router]);
  
  useEffect(() => {
    if (selectedUserId) {
      // Filter subscriptions for the selected user
      const userSubs = subscriptions.filter(sub => sub.user_id === selectedUserId && sub.status === 'active');
      setFilteredSubscriptions(userSubs);
      
      // Clear selected subscription if user changes
      setSelectedSubscriptionId('');
    } else {
      setFilteredSubscriptions([]);
    }
  }, [selectedUserId, subscriptions]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Fetch users
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });
        
      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setUsers([]);
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSubscriptions = async () => {
    try {
      const supabase = createClientComponentClient();
      
      // Fetch active subscriptions
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('id, user_id, plan_id, status, sessions_remaining')
        .in('status', ['active', 'trialing']);
        
      if (error) {
        console.error('Error fetching subscriptions:', error);
        toast.error('Failed to load subscriptions');
        setSubscriptions([]);
      } else {
        setSubscriptions(data || []);
      }
    } catch (error) {
      console.error('Error in fetchSubscriptions:', error);
      toast.error('Failed to load subscriptions');
      setSubscriptions([]);
    }
  };
  
  const handleCreateSession = async () => {
    // Validate form
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }
    
    if (!date) {
      toast.error('Please select a date');
      return;
    }
    
    if (!time) {
      toast.error('Please select a time');
      return;
    }
    
    try {
      setSubmitting(true);
      const supabase = createClientComponentClient();
      
      // Combine date and time
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes);
      
      // Create session
      const { data, error } = await supabase
        .from('coaching_sessions')
        .insert({
          user_id: selectedUserId,
          subscription_id: selectedSubscriptionId || null,
          title,
          description: description || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: parseInt(durationMinutes),
          status: 'scheduled',
          meeting_url: meetingUrl || null,
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating session:', error);
        toast.error('Failed to create session');
      } else {
        toast.success('Session created successfully');
        
        // If this session is part of a subscription, decrement the sessions_remaining
        if (selectedSubscriptionId) {
          const { error: updateError } = await supabase
            .from('user_subscriptions')
            .update({ 
              sessions_remaining: Math.max(0, (filteredSubscriptions.find(s => s.id === selectedSubscriptionId)?.sessions_remaining || 1) - 1) 
            })
            .eq('id', selectedSubscriptionId);
            
          if (updateError) {
            console.error('Error updating subscription:', updateError);
          }
        }
        
        // Redirect to the session details page
        router.push(`/dashboard/admin/coaching/sessions/${data.id}`);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Generate time slots (30-minute intervals from 8 AM to 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        slots.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
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
  
  // Get plan details for a subscription
  const getPlanDetails = (planId: string) => {
    const plan = PRICING_TIERS.find(tier => tier.id === planId);
    return plan ? plan.title : 'Unknown Plan';
  };
  
  return (
    <div className="container py-8 space-y-6">
      <div>
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/dashboard/admin/coaching/calendar" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Calendar
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create Coaching Session</h1>
        <p className="text-muted-foreground mt-1">Schedule a new coaching session for a user</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
          <CardDescription>
            Fill in the details for the new coaching session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user">Client</Label>
              <Select 
                value={selectedUserId} 
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="subscription">Subscription (Optional)</Label>
              <Select 
                value={selectedSubscriptionId} 
                onValueChange={setSelectedSubscriptionId}
                disabled={!selectedUserId || filteredSubscriptions.length === 0}
              >
                <SelectTrigger id="subscription">
                  <SelectValue placeholder={
                    !selectedUserId 
                      ? "Select a client first" 
                      : filteredSubscriptions.length === 0 
                        ? "No active subscriptions" 
                        : "Select a subscription"
                  } />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (One-time Session)</SelectItem>
                  {filteredSubscriptions.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {getPlanDetails(sub.plan_id)} - {sub.sessions_remaining} sessions remaining
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input 
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Coaching Session"
              />
            </div>
            
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Select 
                value={durationMinutes} 
                onValueChange={setDurationMinutes}
              >
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="time">Time</Label>
              <Select 
                value={time} 
                onValueChange={setTime}
              >
                <SelectTrigger id="time">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="meeting-url">Meeting URL (Optional)</Label>
              <Input 
                id="meeting-url"
                value={meetingUrl}
                onChange={(e) => setMeetingUrl(e.target.value)}
                placeholder="https://zoom.us/j/123456789"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about the session..."
                rows={4}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            asChild
          >
            <Link href="/dashboard/admin/coaching/calendar">
              Cancel
            </Link>
          </Button>
          <Button 
            onClick={handleCreateSession}
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Session'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 