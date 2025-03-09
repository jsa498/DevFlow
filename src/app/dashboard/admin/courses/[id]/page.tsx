'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type CourseWithProduct = {
  id: string;
  product_id: string;
  difficulty_level: string | null;
  estimated_duration: string | null;
  prerequisites: string | null;
  created_at: string;
  updated_at: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string | null;
    published: boolean;
  };
};

type Section = {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export default function CourseEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [course, setCourse] = useState<CourseWithProduct | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin && params.id) {
      fetchCourseData();
    }
  }, [user, authLoading, isAdmin, params.id, router]);
  
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Fetch course with product details
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select(`
          *,
          product:products (*)
        `)
        .eq('id', params.id)
        .single();
        
      if (courseError) {
        throw new Error(`Failed to fetch course: ${courseError.message}`);
      }
      
      // Format the course data
      const formattedCourse = {
        ...courseData,
        product: Array.isArray(courseData.product) ? courseData.product[0] : courseData.product
      };
      
      setCourse(formattedCourse);
      
      // Fetch sections for this course
      const { data: sectionsData, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('course_id', params.id)
        .order('order_index', { ascending: true });
        
      if (sectionsError) {
        throw new Error(`Failed to fetch sections: ${sectionsError.message}`);
      }
      
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load course data');
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
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
  
  if (!course) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Course Not Found</CardTitle>
            <CardDescription>
              The course you are looking for does not exist or has been deleted.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/admin/courses">Back to Courses</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard/admin/courses" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
      </Button>
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{course.product.title}</h1>
          <p className="text-muted-foreground mt-1">Course ID: {course.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/courses/${course.product.id}`} target="_blank">
              Preview Course
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
              <CardDescription>
                Basic information about the course.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Title</h3>
                  <p>{course.product.title}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Description</h3>
                  <p className="whitespace-pre-line">{course.product.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="font-medium mb-1">Price</h3>
                    <p>${course.product.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Difficulty Level</h3>
                    <p>{course.difficulty_level || 'Not specified'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Estimated Duration</h3>
                    <p>{course.estimated_duration || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Prerequisites</h3>
                  <p className="whitespace-pre-line">{course.prerequisites || 'None'}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Status</h3>
                  <p>
                    {course.product.published ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full">
                        Draft
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href={`/dashboard/admin/courses/${course.id}/edit`}>
                  Edit Course Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                Manage sections and lessons for this course.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">This course doesn't have any sections yet.</p>
                  <Button asChild>
                    <Link href={`/dashboard/admin/courses/${course.id}/sections/create`}>
                      <Plus className="h-4 w-4 mr-2" /> Add Your First Section
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <Card key={section.id}>
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            Section {index + 1}: {section.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/admin/courses/${course.id}/sections/${section.id}`}>
                                Edit
                              </Link>
                            </Button>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-muted-foreground">
                          {section.description || 'No description provided.'}
                        </p>
                        <div className="mt-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/admin/courses/${course.id}/sections/${section.id}/lessons/create`}>
                              <Plus className="h-4 w-4 mr-2" /> Add Lesson
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <div className="flex justify-center mt-6">
                    <Button asChild>
                      <Link href={`/dashboard/admin/courses/${course.id}/sections/create`}>
                        <Plus className="h-4 w-4 mr-2" /> Add New Section
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Manage course visibility and other settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Visibility</h3>
                  <p>
                    {course.product.published ? 'This course is visible to users.' : 'This course is hidden from users.'}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Created At</h3>
                  <p>{new Date(course.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Last Updated</h3>
                  <p>{new Date(course.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="destructive">
                Delete Course
              </Button>
              <Button variant={course.product.published ? 'outline' : 'default'}>
                {course.product.published ? 'Unpublish Course' : 'Publish Course'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 