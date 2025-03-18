'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function CourseViewPage({ params }: { params: { id: string } }) {
  const courseId = params.id;
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const [course, setCourse] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [activeLessonContent, setActiveLessonContent] = useState<any>(null);
  
  useEffect(() => {
    if (!user) {
      router.push('/signin?callbackUrl=/dashboard');
      return;
    }
    
    async function fetchCourseData() {
      try {
        setLoading(true);
        const supabase = createClientComponentClient();
        
        // Check if user has purchased this course
        if (!user) return;
        
        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchases')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('product_id', courseId)
          .eq('status', 'completed')
          .single();
          
        if (purchaseError && purchaseError.code !== 'PGRST116') {
          console.error('Error checking purchase:', purchaseError);
          toast.error('Error verifying your purchase');
          router.push('/dashboard');
          return;
        }
        
        if (!purchaseData) {
          console.log('User has not purchased this course');
          toast.error('You have not purchased this course');
          router.push('/dashboard');
          return;
        }
        
        setHasPurchased(true);
        
        // Fetch course details
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select(`
            id,
            difficulty_level,
            estimated_duration,
            prerequisites,
            product:products (
              id,
              title,
              description,
              price,
              image_url
            )
          `)
          .eq('product_id', courseId)
          .single();
          
        if (courseError) {
          console.error('Error fetching course:', courseError);
          toast.error('Error loading course content');
          return;
        }
        
        setCourse(courseData);
        
        // Fetch course sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .eq('course_id', courseData.id)
          .order('order_index', { ascending: true });
          
        if (sectionsError) {
          console.error('Error fetching sections:', sectionsError);
          return;
        }
        
        setSections(sectionsData || []);
        
        // Fetch all lessons for this course
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select(`
            id,
            title,
            description,
            content_type,
            content,
            video_url,
            pdf_url,
            section_id,
            order_index
          `)
          .in('section_id', sectionsData.map((s: any) => s.id))
          .order('order_index', { ascending: true });
          
        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
          return;
        }
        
        setLessons(lessonsData || []);
        
        // Set the first lesson as active by default
        if (lessonsData && lessonsData.length > 0) {
          setActiveLesson(lessonsData[0].id);
          setActiveLessonContent(lessonsData[0]);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Error loading course content');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCourseData();
  }, [courseId, router, user]);
  
  const handleLessonClick = (lesson: any) => {
    setActiveLesson(lesson.id);
    setActiveLessonContent(lesson);
    
    // Scroll to the content area on mobile
    if (window.innerWidth < 768) {
      const contentElement = document.getElementById('lesson-content');
      if (contentElement) {
        contentElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>
              The course you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{course.product.title}</CardTitle>
              <CardDescription>
                {course.difficulty_level && (
                  <div className="mt-2">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                      {course.difficulty_level}
                    </span>
                    {course.estimated_duration && (
                      <span className="ml-2 text-xs font-medium bg-muted text-muted-foreground px-2 py-1 rounded">
                        {course.estimated_duration}
                      </span>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto pb-6">
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      {section.title}
                    </h3>
                    <ul className="space-y-1">
                      {lessons
                        .filter((lesson) => lesson.section_id === section.id)
                        .map((lesson) => (
                          <li key={lesson.id}>
                            <button
                              onClick={() => handleLessonClick(lesson)}
                              className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center ${
                                activeLesson === lesson.id
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              {activeLesson === lesson.id ? (
                                <CheckCircle className="mr-2 h-4 w-4 flex-shrink-0" />
                              ) : (
                                <BookOpen className="mr-2 h-4 w-4 flex-shrink-0" />
                              )}
                              <span className="truncate">{lesson.title}</span>
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Course content */}
        <div className="lg:col-span-2" id="lesson-content">
          {activeLessonContent ? (
            <Card>
              <CardHeader>
                <CardTitle>{activeLessonContent.title}</CardTitle>
                <CardDescription>{activeLessonContent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {activeLessonContent.content_type === 'text' && (
                  <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                    {/* Render markdown content */}
                    <div dangerouslySetInnerHTML={{ 
                      __html: activeLessonContent.content
                        ? activeLessonContent.content
                            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                            .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
                            .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
                            .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
                            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
                            .replace(/\*(.*)\*/gim, '<em>$1</em>')
                            .replace(/\n/gim, '<br />')
                        : ''
                    }} />
                  </div>
                )}
                
                {activeLessonContent.content_type === 'video' && activeLessonContent.video_url && (
                  <div className="aspect-video">
                    <iframe
                      src={activeLessonContent.video_url}
                      className="w-full h-full rounded-md"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                
                {activeLessonContent.content_type === 'pdf' && activeLessonContent.pdf_url && (
                  <div className="flex flex-col items-center">
                    <p className="mb-4 text-muted-foreground">
                      This lesson contains a PDF document. Click the button below to view or download it.
                    </p>
                    <Button asChild>
                      <a href={activeLessonContent.pdf_url} target="_blank" rel="noopener noreferrer">
                        View PDF Document
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Lesson</CardTitle>
                <CardDescription>
                  Please select a lesson from the sidebar to view its content.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 