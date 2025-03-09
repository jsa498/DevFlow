import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  
  console.log('Seeding database...');

  // Create sample products
  const products = [
    {
      title: 'Digital Marketing Fundamentals Guide',
      description: 'A comprehensive guide covering all the basics of digital marketing, including SEO, social media marketing, content marketing, email marketing, and PPC advertising. Perfect for beginners looking to understand the digital marketing landscape.',
      price: 49.99,
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      pdfUrl: '/pdfs/digital-marketing-fundamentals.pdf',
      featured: true,
      published: true,
    },
    {
      title: 'Social Media Strategy Blueprint',
      description: 'Learn how to create effective social media strategies for businesses of all sizes. This guide includes templates, case studies, and step-by-step instructions for developing a social media presence that drives engagement and conversions.',
      price: 79.99,
      imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      pdfUrl: '/pdfs/social-media-strategy-blueprint.pdf',
      featured: false,
      published: true,
    },
    {
      title: 'SEO Mastery: Complete Guide',
      description: 'Master the art and science of Search Engine Optimization with this comprehensive guide. Learn about on-page and off-page SEO, technical SEO, keyword research, link building strategies, and how to measure SEO success.',
      price: 99.99,
      imageUrl: 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      pdfUrl: '/pdfs/seo-mastery-guide.pdf',
      featured: true,
      published: true,
    },
    {
      title: 'Email Marketing Conversion Tactics',
      description: 'Discover proven email marketing strategies that convert subscribers into customers. This guide covers list building, segmentation, automation, A/B testing, copywriting for emails, and analytics to optimize your campaigns.',
      price: 69.99,
      imageUrl: 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      pdfUrl: '/pdfs/email-marketing-conversion-tactics.pdf',
      featured: false,
      published: true,
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 