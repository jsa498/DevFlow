'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminSetupPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  const handleSetupDatabase = async () => {
    if (!isAdmin) {
      setError('You do not have permission to perform this action');
      return;
    }
    
    try {
      setIsSettingUp(true);
      setMessage('');
      setError('');
      
      // Create profiles table in Supabase
      const supabase = createClientComponentClient();
      
      // Create profiles table
      const { data, error: createError } = await supabase.rpc('create_profiles_table_manually', {
        sql_command: `
          CREATE TABLE IF NOT EXISTS public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            full_name TEXT,
            role TEXT DEFAULT 'USER',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          -- Create function to handle new user signups
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.profiles (id, email, full_name)
            VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
          
          -- Create trigger for new users
          DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
          CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `
      });
      
      if (createError) {
        throw new Error(createError.message);
      }
      
      // Update existing users
      const { error: updateError } = await supabase.rpc('update_existing_users_profiles', {
        sql_command: `
          INSERT INTO public.profiles (id, email, full_name)
          SELECT id, email, raw_user_meta_data->>'full_name'
          FROM auth.users
          WHERE id NOT IN (SELECT id FROM public.profiles)
          ON CONFLICT (id) DO NOTHING;
        `
      });
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      setMessage('Database setup completed successfully!');
    } catch (error) {
      console.error('Error setting up database:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during setup');
    } finally {
      setIsSettingUp(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
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
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Database Setup</CardTitle>
          <CardDescription>
            Set up the database tables required for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            This will create the necessary tables and functions in your Supabase database:
          </p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Profiles table to store user information</li>
            <li>Functions to handle new user signups</li>
            <li>Triggers to automatically create profiles for new users</li>
          </ul>
          
          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSetupDatabase} 
            disabled={isSettingUp}
          >
            {isSettingUp ? 'Setting Up...' : 'Set Up Database'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 