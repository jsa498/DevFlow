'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusCircle, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type Course = {
  id: string;
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    image_url: string | null;
    published: boolean;
  };
  difficulty_level: string | null;
  estimated_duration: string | null;
  prerequisites: string | null;
  created_at: string;
};

export default function CoursesManagementPage() {
  const router = useRouter();
  const { user, isLoading } = useSupabaseAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchCourses();
    }
  }, [user, isLoading, isAdmin, router]);
  
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const supabase = createClientComponentClient();
      
      // Get all courses with their associated products
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          difficulty_level,
          estimated_duration,
          prerequisites,
          created_at,
          product:products (
            id,
            title,
            description,
            price,
            image_url,
            published
          )
        `)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
        toast.error('Failed to load courses');
      } else {
        console.log('Courses fetched:', data?.length);
        // Transform the data to match our Course type
        const formattedCourses = data?.map(course => ({
          ...course,
          product: Array.isArray(course.product) ? course.product[0] : course.product
        })) || [];
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      const supabase = createClientComponentClient();
      
      // Delete the course
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
        
      if (error) {
        console.error('Error deleting course:', error);
        toast.error('Failed to delete course');
      } else {
        // Update the local state
        setCourses(courses.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };
  
  if (isLoading || loading) {
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
  
  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-4">
            <Link href="/dashboard/admin" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Admin Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage interactive courses</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/courses/create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>
      
      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Found</CardTitle>
            <CardDescription>
              You haven't created any courses yet. Get started by creating your first course.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/dashboard/admin/courses/create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Create Your First Course
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-64 h-48 bg-muted">
                  {course.product.image_url ? (
                    <img 
                      src={course.product.image_url} 
                      alt={course.product.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <span className="text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold">{course.product.title}</h2>
                    <div className="flex items-center gap-2">
                      {course.product.published ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 rounded-full">
                          Draft
                        </span>
                      )}
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 rounded-full">
                        ${course.product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{course.product.description}</p>
                  <div className="flex flex-wrap gap-4 mb-4">
                    {course.difficulty_level && (
                      <div className="text-sm">
                        <span className="font-medium">Difficulty:</span> {course.difficulty_level}
                      </div>
                    )}
                    {course.estimated_duration && (
                      <div className="text-sm">
                        <span className="font-medium">Duration:</span> {course.estimated_duration}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/courses/${course.product.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Preview
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/courses/${course.id}`} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit
                      </Link>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 