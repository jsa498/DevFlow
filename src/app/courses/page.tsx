import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { ArrowRight } from 'lucide-react';

export default async function CoursesPage() {
  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get all published products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <main className="bg-background min-h-screen pb-16">
      {/* Hero section */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-10 dark:opacity-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/40 to-primary blur-3xl" />
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)] dark:bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_100%)]" />
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground mb-6">
              Digital Marketing Courses
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mb-6"></div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              Premium tools and resources to help you master digital marketing strategies and grow your online presence.
            </p>
          </div>
        </div>
      </div>
      
      {/* Products grid */}
      <div className="container mx-auto px-4 mt-4">
        {!products || products.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">No Courses Available</h3>
            <p className="text-muted-foreground mb-6">We're currently working on new courses. Please check back later.</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Return to Homepage <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="group relative bg-card hover:bg-card/90 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                      <svg className="w-16 h-16 text-muted-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    <Link 
                      href={`/courses/${product.id}`}
                      className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {product.title}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-6 line-clamp-3">{product.description}</p>
                  <div className="flex items-center justify-end">
                    <Link 
                      href={`/courses/${product.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      View Details <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Why Choose Our Resources section */}
      <div className="container mx-auto px-4 mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Choose Our Courses</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary/80 to-primary/20 rounded-full mx-auto mb-6"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative bg-gradient-to-b from-background to-muted/20 p-8 rounded-2xl border border-border/40 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-8 -mr-8 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-6 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16.5V14.5M12 9V11M12 4.5C7.80558 4.5 4.5 7.80558 4.5 12C4.5 16.1944 7.80558 19.5 12 19.5C16.1944 19.5 19.5 16.1944 19.5 12C19.5 7.80558 16.1944 4.5 12 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Expert Knowledge</h3>
            <p className="text-muted-foreground">Created by industry professionals with years of experience in digital marketing.</p>
          </div>
          
          <div className="relative bg-gradient-to-b from-background to-muted/20 p-8 rounded-2xl border border-border/40 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-8 -mr-8 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-6 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.5 14.25V11.625C19.5 9.76104 17.989 8.25 16.125 8.25H14.625C14.0037 8.25 13.5 7.74632 13.5 7.125V5.625C13.5 3.76104 11.989 2.25 10.125 2.25H8.25M15 14.25H9M10.5 16.5L8.25 14.25L10.5 12M10.5 2.25H5.625C5.00368 2.25 4.5 2.75368 4.5 3.375V20.625C4.5 21.2463 5.00368 21.75 5.625 21.75H18.375C18.9963 21.75 19.5 21.2463 19.5 20.625V11.25C19.5 6.27944 15.4706 2.25 10.5 2.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Practical Guides</h3>
            <p className="text-muted-foreground">Step-by-step instructions and actionable strategies you can implement immediately.</p>
          </div>
          
          <div className="relative bg-gradient-to-b from-background to-muted/20 p-8 rounded-2xl border border-border/40 hover:border-primary/20 transition-all hover:shadow-lg hover:shadow-primary/5 group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-8 -mr-8 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="mb-6 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6.05334V19.1973M12 6.05334C10.6615 5.5751 9.22143 5.32412 7.74847 5.32412C6.27551 5.32412 4.83538 5.5751 3.49695 6.05334V19.1973C4.83538 18.7191 6.27551 18.4681 7.74847 18.4681C9.22143 18.4681 10.6615 18.7191 12 19.1973M12 6.05334C13.3385 5.5751 14.7786 5.32412 16.2515 5.32412C17.7245 5.32412 19.1646 5.5751 20.503 6.05334V19.1973C19.1646 18.7191 17.7245 18.4681 16.2515 18.4681C14.7786 18.4681 13.3385 18.7191 12 19.1973" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Lifetime Access</h3>
            <p className="text-muted-foreground">Purchase once and get unlimited access to the courses, including future updates.</p>
          </div>
        </div>
      </div>
    </main>
  );
} 