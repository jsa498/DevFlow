import { createClient } from '@supabase/supabase-js';
import HomePageContent from '../components/homepage-content';

export default async function Home() {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get all published courses for the homepage display
  const { data: courses, error } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching products:', error);
  }

  console.log(`Fetched ${courses?.length || 0} courses for homepage display`);

  // Pass all courses to the HomePageContent component
  // We're using the same courses for both featuredProducts and courses props
  // since we're displaying all courses in the featured section now
  return <HomePageContent featuredProducts={courses || []} courses={courses || []} />;
}
