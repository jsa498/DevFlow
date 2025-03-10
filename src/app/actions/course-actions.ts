'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { COURSE_TEMPLATES } from '@/lib/course-templates';

// Function to automatically create a course
export async function createAutomaticCourse(templateKey: string) {
  try {
    // First, verify the user is an admin
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return { success: false, error: 'Not authorized - admin role required' };
    }
    
    // Get the course template
    const template = COURSE_TEMPLATES[templateKey];
    if (!template) {
      return { success: false, error: 'Invalid template key' };
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
    
    // 1. Create the product first
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        title: template.title,
        description: template.description,
        price: template.price,
        image_url: template.image_url,
        pdf_url: 'https://example.com/placeholder.pdf', // Use a valid placeholder URL
        featured: true,
        published: template.published,
      })
      .select()
      .single();
      
    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`);
    }
    
    // 2. Create the course linked to the product
    const { data: course, error: courseError } = await supabaseAdmin
      .from('courses')
      .insert({
        product_id: product.id,
        difficulty_level: template.difficulty_level,
        estimated_duration: template.estimated_duration,
        prerequisites: template.prerequisites,
      })
      .select()
      .single();
      
    if (courseError) {
      // If course creation fails, we should delete the product to avoid orphaned records
      await supabaseAdmin.from('products').delete().eq('id', product.id);
      throw new Error(`Failed to create course: ${courseError.message}`);
    }
    
    // 3. Create sections and lessons
    for (let i = 0; i < template.sections.length; i++) {
      const sectionTemplate = template.sections[i];
      
      // Create section
      const { data: section, error: sectionError } = await supabaseAdmin
        .from('sections')
        .insert({
          course_id: course.id,
          title: sectionTemplate.title,
          description: sectionTemplate.description,
          order_index: i,
        })
        .select()
        .single();
        
      if (sectionError) {
        throw new Error(`Failed to create section: ${sectionError.message}`);
      }
      
      // Create lessons for this section
      for (let j = 0; j < sectionTemplate.lessons.length; j++) {
        const lessonTemplate = sectionTemplate.lessons[j];
        
        // Create a lesson object with only the properties that exist in the template
        const lessonData: any = {
          section_id: section.id,
          title: lessonTemplate.title,
          description: lessonTemplate.description,
          content_type: lessonTemplate.content_type,
          content: lessonTemplate.content,
          order_index: j,
        };
        
        // Only add these properties if they exist in the template
        if ('video_url' in lessonTemplate) {
          lessonData.video_url = lessonTemplate.video_url;
        }
        
        if ('pdf_url' in lessonTemplate) {
          lessonData.pdf_url = lessonTemplate.pdf_url;
        }
        
        if ('duration' in lessonTemplate) {
          lessonData.duration = lessonTemplate.duration;
        }
        
        const { error: lessonError } = await supabaseAdmin
          .from('lessons')
          .insert(lessonData);
          
        if (lessonError) {
          throw new Error(`Failed to create lesson: ${lessonError.message}`);
        }
      }
    }
    
    return { 
      success: true, 
      data: { 
        product_id: product.id,
        course_id: course.id,
        title: template.title
      } 
    };
  } catch (error) {
    console.error('Error in createAutomaticCourse action:', error);
    return { success: false, error: String(error) };
  }
}

// Function to create all predefined courses
export async function createAllPredefinedCourses() {
  try {
    const results = [];
    const templateKeys = Object.keys(COURSE_TEMPLATES);
    
    for (const key of templateKeys) {
      const result = await createAutomaticCourse(key);
      results.push({ key, result });
    }
    
    return { success: true, data: results };
  } catch (error) {
    console.error('Error creating predefined courses:', error);
    return { success: false, error: String(error) };
  }
}

// Function to get available course templates
export async function getAvailableCourseTemplates() {
  // Return just the keys and basic info about each template
  const templates = Object.keys(COURSE_TEMPLATES).map(key => ({
    key,
    title: COURSE_TEMPLATES[key].title,
    description: COURSE_TEMPLATES[key].description,
    price: COURSE_TEMPLATES[key].price,
    difficulty_level: COURSE_TEMPLATES[key].difficulty_level,
  }));
  
  return { success: true, data: templates };
}

// Function to delete a course and its associated product
export async function deleteCourse(courseId: string, productId: string) {
  try {
    // First, verify the user is an admin
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const user = session.user;
    const isAdmin = user.app_metadata?.role === 'admin';
    
    if (!isAdmin) {
      return { success: false, error: 'Not authorized - admin role required' };
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
      return { success: false, error: 'Failed to delete course: Could not fetch sections' };
    }
    
    // Delete lessons for each section
    for (const section of sections || []) {
      const { error: lessonsError } = await supabaseAdmin
        .from('lessons')
        .delete()
        .eq('section_id', section.id);
        
      if (lessonsError) {
        console.error(`Error deleting lessons for section ${section.id}:`, lessonsError);
        return { success: false, error: `Failed to delete lessons for section ${section.id}` };
      }
    }
    
    // Delete sections
    const { error: deleteSectionsError } = await supabaseAdmin
      .from('sections')
      .delete()
      .eq('course_id', courseId);
      
    if (deleteSectionsError) {
      console.error('Error deleting sections:', deleteSectionsError);
      return { success: false, error: 'Failed to delete sections' };
    }
    
    // Delete the course
    const { error: deleteCourseError } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId);
      
    if (deleteCourseError) {
      console.error('Error deleting course:', deleteCourseError);
      return { success: false, error: 'Failed to delete course' };
    }
    
    // Delete the product
    const { error: deleteProductError } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (deleteProductError) {
      console.error('Error deleting product:', deleteProductError);
      return { success: false, error: 'Failed to delete product associated with course' };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteCourse action:', error);
    return { success: false, error: String(error) };
  }
} 