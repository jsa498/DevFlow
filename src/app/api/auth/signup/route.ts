import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Sign up user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'user'
        }
      }
    });

    if (authError) {
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      );
    }

    // Create profile entry if needed
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          full_name: name,
          email: email,
          role: 'USER'
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          name: name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
} 