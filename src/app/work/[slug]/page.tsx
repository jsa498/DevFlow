import { Metadata } from 'next';
import { ProjectType } from '@/types/project';
import ProjectContent from '@/components/ProjectContent';

const projects: Record<string, ProjectType> = {
  'erp-manufacturing': {
    title: 'ERP for Wood Shop',
    description: 'Custom ERP solution for a wood manufacturing company',
    fullDescription: 'A comprehensive ERP system that streamlines operations, inventory management, and order processing for a wood manufacturing business.',
    features: [
      'Real-time inventory tracking',
      'Order management system',
      'Production scheduling',
      'Quality control tracking'
    ]
  },
  'ecommerce-platform': {
    title: 'Complex eCommerce Store',
    description: 'Advanced eCommerce platform with custom features',
    fullDescription: 'A sophisticated eCommerce platform built with modern technologies, offering seamless shopping experiences and advanced management capabilities.',
    features: [
      'Custom product configurator',
      'Advanced inventory management',
      'Multi-vendor support',
      'Real-time analytics'
    ]
  },
  'shopify-builder': {
    title: 'Shopify Storefront Builder',
    description: 'Custom Shopify storefront development tool',
    fullDescription: 'A powerful tool that enables quick and efficient creation of custom Shopify storefronts with advanced features and optimizations.',
    features: [
      'Drag-and-drop builder',
      'Custom section templates',
      'Performance optimization',
      'SEO tools integration'
    ]
  },
  'ai-documents': {
    title: 'AI Powered Documents',
    description: 'Intelligent document processing system',
    fullDescription: 'An AI-powered system that automates document processing, extraction, and analysis for improved efficiency and accuracy.',
    features: [
      'OCR capabilities',
      'Machine learning models',
      'Automated data extraction',
      'Document classification'
    ]
  }
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = projects[params.slug];
  
  if (!project) {
    return {
      title: 'Project Not Found | DevFlow',
      description: 'The requested project could not be found.'
    };
  }

  return {
    title: `${project.title} | DevFlow Case Study`,
    description: project.description,
    openGraph: {
      title: `${project.title} | DevFlow Case Study`,
      description: project.description,
      url: `https://devflow.ca/work/${params.slug}`,
      siteName: 'DevFlow',
      images: [
        {
          url: `/projects/${params.slug}.jpg`,
          width: 1200,
          height: 630,
          alt: project.title
        }
      ],
      locale: 'en_CA',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.description,
      images: [`/projects/${params.slug}.jpg`],
    }
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects[params.slug];

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
          <p className="text-gray-400">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
        <p className="text-xl text-gray-400 mb-12">{project.description}</p>
        
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Overview</h2>
          <p className="text-gray-300">{project.fullDescription}</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Key Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 