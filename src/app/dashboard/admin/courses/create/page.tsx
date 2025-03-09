'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  difficulty_level: z.string().optional(),
  estimated_duration: z.string().optional(),
  prerequisites: z.string().optional(),
  published: z.boolean().default(false),
  image_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useSupabaseAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      difficulty_level: 'beginner',
      estimated_duration: '',
      prerequisites: '',
      published: false,
      image_url: '',
    },
  });
  
  // Check if user is admin
  const isAdmin = user?.app_metadata?.role === 'admin';
  
  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!isAdmin) {
      toast.error('You do not have permission to create courses');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const supabase = createClientComponentClient();
      
      // 1. Create the product first
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          title: values.title,
          description: values.description,
          price: values.price,
          image_url: values.image_url || null,
          pdf_url: '', // We'll update this later if needed
          published: values.published,
        })
        .select()
        .single();
        
      if (productError) {
        throw new Error(`Failed to create product: ${productError.message}`);
      }
      
      // 2. Create the course linked to the product
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert({
          product_id: product.id,
          difficulty_level: values.difficulty_level || null,
          estimated_duration: values.estimated_duration || null,
          prerequisites: values.prerequisites || null,
        })
        .select()
        .single();
        
      if (courseError) {
        // If course creation fails, we should delete the product to avoid orphaned records
        await supabase.from('products').delete().eq('id', product.id);
        throw new Error(`Failed to create course: ${courseError.message}`);
      }
      
      toast.success('Course created successfully');
      
      // Redirect to the course editor page
      router.push(`/dashboard/admin/courses/${course.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authLoading) {
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
    <div className="container py-8 max-w-3xl mx-auto">
      <Button variant="outline" size="sm" asChild className="mb-6">
        <Link href="/dashboard/admin/courses" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Courses
        </Link>
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Course</CardTitle>
          <CardDescription>
            Fill in the basic information to create your course. You can add sections and lessons later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Social Media Marketing Masterclass" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, descriptive title for your course.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe what students will learn in this course..." 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A detailed description of the course content and learning outcomes.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" {...field} />
                      </FormControl>
                      <FormDescription>
                        Set the price for this course.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="difficulty_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                          <SelectItem value="all-levels">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The recommended skill level for this course.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="estimated_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 4 weeks, 10 hours, etc." {...field} />
                    </FormControl>
                    <FormDescription>
                      How long it typically takes to complete this course.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prerequisites"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prerequisites</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any prior knowledge or skills required..." 
                        className="min-h-20"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Any prerequisites or requirements for taking this course.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      A URL to an image that represents your course. We'll add image upload functionality later.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publish Course</FormLabel>
                      <FormDescription>
                        When enabled, the course will be visible to users.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Course'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 