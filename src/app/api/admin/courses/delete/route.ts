import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export async function DELETE(request: NextRequest) {
  try {
    // Parse the request body to get courseId and productId
    const { courseId, productId } = await request.json();
    
    if (!courseId || !productId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: courseId and productId' },
        { status: 400 }
      );
    }
    
    // First, verify the user is an admin
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }
    
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Not authorized - admin role required' }, { status: 403 });
    }
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // First, delete all lessons associated with this course's sections
    // Get all sections for this course
    const { data: sections, error: sectionsError } = await supabaseAdmin
      .from('sections')
      .select('id')
      .eq('course_id', courseId);
      
    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete course: Could not fetch sections' },
        { status: 500 }
      );
    }
    
    // Delete lessons for each section
    for (const section of sections || []) {
      const { error: lessonsError } = await supabaseAdmin
        .from('lessons')
        .delete()
        .eq('section_id', section.id);
        
      if (lessonsError) {
        console.error(`Error deleting lessons for section ${section.id}:`, lessonsError);
        return NextResponse.json(
          { success: false, error: `Failed to delete lessons for section ${section.id}` },
          { status: 500 }
        );
      }
    }
    
    // Delete sections
    const { error: deleteSectionsError } = await supabaseAdmin
      .from('sections')
      .delete()
      .eq('course_id', courseId);
      
    if (deleteSectionsError) {
      console.error('Error deleting sections:', deleteSectionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete sections' },
        { status: 500 }
      );
    }
    
    // Delete the course
    const { error: deleteCourseError } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId);
      
    if (deleteCourseError) {
      console.error('Error deleting course:', deleteCourseError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete course' },
        { status: 500 }
      );
    }
    
    // Delete the product
    const { error: deleteProductError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (deleteProductError) {
      console.error('Error deleting product:', deleteProductError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete product associated with course' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE course API route:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 