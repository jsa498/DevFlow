'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the course page with the same ID
    router.replace(`/courses/${params.id}`);
  }, [params.id, router]);
  
  // Show a loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse flex flex-col items-center space-y-4">
        <div className="rounded-full bg-muted h-16 w-16"></div>
        <div className="h-4 bg-muted rounded w-32"></div>
        <div className="h-2 bg-muted rounded w-48"></div>
      </div>
    </div>
  );
} 