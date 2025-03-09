'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type CoachingService = {
  id: string;
  title: string;
  description: string;
  initial_consultation_price: number;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export default function ConsultationBookingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [service, setService] = useState<CoachingService | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        // Fetch coaching service details
        const { data, error } = await supabase
          .from('coaching_services')
          .select('*')
          .eq('id', params.id)
          .eq('published', true)
          .single();
          
        if (error) {
          console.error('Error fetching coaching service:', error);
          toast.error('Service not found');
          router.push('/build');
          return;
        }
        
        setService(data);
      } catch (error) {
        console.error('Error in fetchServiceDetails:', error);
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) {
      fetchServiceDetails();
    }
  }, [params.id, router]);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/signin?callbackUrl=/build/consultation/${params.id}`);
    }
  }, [user, authLoading, router, params.id]);
  
  const handleBookConsultation = async () => {
    if (!user) {
      toast.error('You must be signed in to book a consultation');
      router.push(`/signin?callbackUrl=/build/consultation/${params.id}`);
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
      
      // Create a Stripe checkout session for the consultation
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service?.id,
          scheduledAt: scheduledAt.toISOString(),
          isConsultation: true,
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
  
  if (!service) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Service Not Found</CardTitle>
            <CardDescription>
              The coaching service you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/build">Back to Coaching Services</Link>
            </Button>
          </CardFooter>
        </Card>
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
            Schedule a one-time consultation with our expert to discuss your digital marketing needs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
              
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span>60-minute consultation</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <span>One-time session</span>
              </div>
              
              <div className="text-2xl font-bold mb-4">${service.initial_consultation_price.toFixed(2)}</div>
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
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleBookConsultation} 
            disabled={isSubmitting || !bookingDate || !bookingTime}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Book and Pay Now'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 