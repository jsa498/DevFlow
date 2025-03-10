'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Edit, Trash2, Eye, ArrowLeft, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { deleteCourse } from '@/app/actions/course-actions';

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
  const [isCreatingCourses, setIsCreatingCourses] = useState(false);
  const [hasAttemptedAutoCreation, setHasAttemptedAutoCreation] = useState(false);
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Memoize the fetchCourses function
  const fetchCourses = useCallback(async () => {
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
        return [];
      } else {
        console.log('Courses fetched:', data?.length);
        // Transform the data to match our Course type
        const formattedCourses = data?.map(course => ({
          ...course,
          product: Array.isArray(course.product) ? course.product[0] : course.product
        })) || [];
        
        setCourses(formattedCourses);
        return formattedCourses;
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
      toast.error('Failed to load courses');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Memoize the handleCreateAllCourses function
  const handleCreateAllCourses = useCallback(async () => {
    if (isCreatingCourses) return; // Prevent multiple simultaneous creations
    
    try {
      setIsCreatingCourses(true);
      toast.info('Creating predefined courses. This may take a moment...');
      
      const response = await fetch('/api/admin/create-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Courses created successfully!');
        fetchCourses(); // Refresh the course list
      } else {
        toast.error(`Failed to create courses: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating courses:', error);
      toast.error('Failed to create courses');
    } finally {
      setIsCreatingCourses(false);
    }
  }, [isCreatingCourses, fetchCourses]);

  const handleDeleteCourse = async (courseId: string, productId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Call the server action to delete the course
      const result = await deleteCourse(courseId, productId);
      
      if (result.success) {
        // Update the local state
        setCourses(courses.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      } else {
        console.error('Error deleting course:', result.error);
        toast.error(`Failed to delete course: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setLoading(false);
    }
  };
  
  // Alternative implementation using the API route
  // Uncomment this and comment out the above implementation if needed
  /*
  const handleDeleteCourse = async (courseId: string, productId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      
      // Call the API route to delete the course
      const response = await fetch('/api/admin/courses/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseId, productId }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update the local state
        setCourses(courses.filter(course => course.id !== courseId));
        toast.success('Course deleted successfully');
      } else {
        console.error('Error deleting course:', result.error);
        toast.error(`Failed to delete course: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    } finally {
      setLoading(false);
    }
  };
  */

  // Initial load effect
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/dashboard');
      return;
    }
    
    if (user && isAdmin) {
      fetchCourses().then((fetchedCourses) => {
        // If no courses exist and we haven't attempted auto-creation yet, create them
        if (fetchedCourses.length === 0 && !hasAttemptedAutoCreation && !isCreatingCourses) {
          setHasAttemptedAutoCreation(true);
          handleCreateAllCourses();
        }
      });
    }
  }, [user, isLoading, isAdmin, router, fetchCourses, handleCreateAllCourses, isCreatingCourses, hasAttemptedAutoCreation]);
  
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
          <p className="text-muted-foreground mt-1">Manage your digital marketing courses</p>
        </div>
        <Button 
          onClick={() => handleCreateAllCourses()} 
          disabled={isCreatingCourses}
          className="flex items-center gap-2"
        >
          <Wand2 className="h-4 w-4" /> 
          {isCreatingCourses ? 'Creating Courses...' : 'Create Courses'}
        </Button>
      </div>
      
      {courses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Courses Found</CardTitle>
            <CardDescription>
              You haven't created any courses yet. Use the "Create Courses" button to generate predefined courses.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => handleCreateAllCourses()} 
              disabled={isCreatingCourses}
              className="flex items-center gap-2"
            >
              <Wand2 className="h-4 w-4" /> 
              {isCreatingCourses ? 'Creating Courses...' : 'Create All Predefined Courses'}
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
                      onClick={() => handleDeleteCourse(course.id, course.product.id)}
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