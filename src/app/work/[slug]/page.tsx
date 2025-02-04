import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';

const projects = {
  'erp-manufacturing': {
    title: 'ERP for Wood Shop',
    description: 'Custom ERP solution for manufacturing with inventory tracking and production management.',
    fullDescription: `Our custom ERP solution revolutionized operations for a wood manufacturing business. 
    The system integrates inventory tracking, production management, and real-time analytics to streamline 
    their entire workflow.`,
    features: [
      'Real-time inventory tracking',
      'Production scheduling',
      'Quality control management',
      'Cost tracking and analysis',
      'Employee performance metrics'
    ]
  },
  'ecommerce-platform': {
    title: 'Complex eCommerce Store',
    description: 'Full-featured e-commerce platform with inventory management and payment processing.',
    fullDescription: `We built a sophisticated e-commerce platform that handles complex product configurations, 
    real-time inventory management, and seamless payment processing. The platform supports multiple vendors 
    and includes advanced analytics.`,
    features: [
      'Multi-vendor support',
      'Real-time inventory sync',
      'Advanced analytics dashboard',
      'Automated order processing',
      'Customer relationship management'
    ]
  },
  'shopify-builder': {
    title: 'Shopify Storefront Builder',
    description: 'Custom Shopify storefront builder with advanced customization options.',
    fullDescription: `Our Shopify storefront builder empowers merchants to create unique shopping experiences. 
    The drag-and-drop interface combined with advanced customization options allows for unlimited design possibilities 
    while maintaining optimal performance.`,
    features: [
      'Drag-and-drop interface',
      'Custom theme components',
      'Performance optimization',
      'Mobile-first design',
      'SEO optimization tools'
    ]
  },
  'ai-documents': {
    title: 'AI Powered Documents',
    description: 'Smart document processing system with AI integration.',
    fullDescription: `We developed an AI-powered document processing system that automates data extraction, 
    classification, and analysis. The system learns from user interactions to improve accuracy over time.`,
    features: [
      'Automated data extraction',
      'Document classification',
      'Machine learning integration',
      'Workflow automation',
      'Compliance tracking'
    ]
  }
};

interface PageProps {
  params: { slug: string };
}

export default function ProjectPage({ params }: PageProps) {
  const { slug } = params;
  const project = projects[slug as keyof typeof projects];

  if (!project) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <Link href="/work" className="text-blue-400 hover:text-blue-500">
            Back to Work
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {project.title}
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              {project.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Project Details */}
      <section className="py-20 bg-zinc-900/50">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Overview</h2>
              <p className="text-gray-400 leading-relaxed">
                {project.fullDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Key Features</h2>
              <ul className="space-y-4">
                {project.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-400">
                    <svg className="w-5 h-5 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      <ConsultationCTA />
      <Footer />
    </main>
  );
} 