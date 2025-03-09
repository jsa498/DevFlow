'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Loader2, Info, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { INITIAL_CONSULTATION_PRICE } from '@/lib/pricing-tiers';

export default function ConsultationBookingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  
  useEffect(() => {
    // Simulate loading for a smoother experience
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signin?callbackUrl=/build/consultation/initial`);
    }
  }, [user, authLoading, router]);
  
  const handlePreferredDayToggle = (day: string) => {
    setPreferredDays(current => 
      current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day]
    );
  };
  
  const handleBookConsultation = async () => {
    if (!user) {
      toast.error('You must be signed in to book a consultation');
      router.push(`/signin?callbackUrl=/build/consultation/initial`);
      return;
    }
    
    if (!bookingDate || !bookingTime) {
      toast.error('Please select a date and time for your consultation');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a Date object from the selected date and time
      const scheduledAt = new Date(`${bookingDate}T${bookingTime}`);
      
      // Check if the date is valid
      if (isNaN(scheduledAt.getTime())) {
        toast.error('Invalid date or time selected');
        setIsSubmitting(false);
        return;
      }
      
      // Store preferred days in localStorage for later use during subscription
      if (preferredDays.length > 0) {
        localStorage.setItem('preferredCoachingDays', JSON.stringify(preferredDays));
      }
      
      // Create a Stripe checkout session for the consultation
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: INITIAL_CONSULTATION_PRICE,
          title: 'Initial Consultation',
          scheduledAt: scheduledAt.toISOString(),
          isConsultation: true,
          preferredDays: preferredDays,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe checkout
      router.push(`/checkout?session_id=${data.sessionId}`);
    } catch (error) {
      console.error('Error booking consultation:', error);
      toast.error('Failed to book consultation');
    } finally {
      setIsSubmitting(false);
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
  
  // Calculate available dates (next 14 days, excluding weekends)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (0 = Sunday, 6 = Saturday)
      const day = date.getDay();
      if (day !== 0 && day !== 6) {
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
        });
      }
    }
    
    return dates;
  };
  
  // Available time slots (9 AM to 5 PM, hourly)
  const getAvailableTimeSlots = () => {
    const times = [];
    
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      times.push({
        value: `${formattedHour}:00:00`,
        label: `${hour % 12 || 12}:00 ${hour < 12 ? 'AM' : 'PM'}`,
      });
    }
    
    return times;
  };
  
  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimeSlots();
  
  // Days of the week for recurring sessions
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
  ];
  
  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/build" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Coaching Services
        </Link>
      </Button>
      
      <Card className="border border-border/40 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Book Initial Consultation</CardTitle>
          <CardDescription>
            Schedule a one-time consultation to discuss your project needs and goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">One-on-One Coaching</h3>
              <p className="text-muted-foreground mb-4">
                Get personalized guidance to build anything you want. Our experts will help you with design, development, and AI integration.
              </p>
              
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>60-minute consultation</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <span>One-time session</span>
              </div>
              
              <div className="text-2xl font-bold mb-4">${INITIAL_CONSULTATION_PRICE.toFixed(2)}</div>
            </div>
            
            <div className="md:w-1/2 space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Select a Date
                </label>
                <select
                  id="date"
                  className="w-full p-2 border rounded-md"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                >
                  <option value="">Select a date</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium mb-1">
                  Select a Time
                </label>
                <select
                  id="time"
                  className="w-full p-2 border rounded-md"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Preferred Days for Future Sessions</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              If you plan to subscribe to a coaching plan after your consultation, please select your preferred days for recurring sessions.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {daysOfWeek.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={day.value} 
                    checked={preferredDays.includes(day.value)}
                    onCheckedChange={() => handlePreferredDayToggle(day.value)}
                  />
                  <Label htmlFor={day.value}>{day.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleBookConsultation} 
            disabled={isSubmitting || !bookingDate || !bookingTime}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Book Consultation'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 