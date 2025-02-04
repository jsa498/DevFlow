import { ProjectType } from '@/types/project';
import ProjectContent from '@/components/ProjectContent';

const projects: Record<string, ProjectType> = {
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
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const project = projects[slug];
  return <ProjectContent project={project} />;
} 