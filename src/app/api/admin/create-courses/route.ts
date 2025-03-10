import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { COURSE_TEMPLATES } from '@/lib/course-templates';

export async function POST() {
  try {
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
    
    // First, check for existing courses to avoid duplicates
    const { data: existingCourses } = await supabaseAdmin
      .from('courses')
      .select(`
        id,
        difficulty_level,
        product:products (
          id,
          title
        )
      `);
    
    // Create a map of existing courses by title and difficulty level
    const existingCoursesMap = new Map();
    existingCourses?.forEach(course => {
      const product = Array.isArray(course.product) ? course.product[0] : course.product;
      if (product && product.title) {
        const key = `${product.title}-${course.difficulty_level || ''}`;
        existingCoursesMap.set(key, course);
      }
    });
    
    const results = [];
    const templateKeys = Object.keys(COURSE_TEMPLATES);
    
    for (const key of templateKeys) {
      const template = COURSE_TEMPLATES[key];
      
      // Skip if a course with this title and difficulty level already exists
      const courseKey = `${template.title}-${template.difficulty_level || ''}`;
      if (existingCoursesMap.has(courseKey)) {
        results.push({ 
          key, 
          success: true, 
          skipped: true,
          message: `Course "${template.title}" with difficulty level "${template.difficulty_level}" already exists, skipping creation.`
        });
        continue;
      }
      
      try {
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
          results.push({ key, success: false, error: `Failed to create product: ${productError.message}` });
          continue;
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
          results.push({ key, success: false, error: `Failed to create course: ${courseError.message}` });
          continue;
        }
        
        // 3. Create sections and lessons
        let sectionsCreated = true;
        
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
            sectionsCreated = false;
            results.push({ key, success: false, error: `Failed to create section: ${sectionError.message}` });
            break;
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
              sectionsCreated = false;
              results.push({ key, success: false, error: `Failed to create lesson: ${lessonError.message}` });
              break;
            }
          }
          
          if (!sectionsCreated) {
            break;
          }
        }
        
        if (sectionsCreated) {
          results.push({ 
            key, 
            success: true, 
            data: { 
              product_id: product.id,
              course_id: course.id,
              title: template.title
            } 
          });
        }
      } catch (error) {
        results.push({ key, success: false, error: String(error) });
      }
    }
    
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Error creating courses:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 