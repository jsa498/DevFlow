'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';

const projects = [
  {
    title: "ERP for Wood Shop",
    description: "Custom ERP solution for manufacturing with inventory tracking and production management.",
    image: "/project-erp.png",
    tags: ["Web App", "ERP", "Manufacturing"],
    slug: "erp-manufacturing"
  },
  {
    title: "Complex eCommerce Store",
    description: "Full-featured e-commerce platform with inventory management and payment processing.",
    image: "/project-ecommerce.png",
    tags: ["E-commerce", "Web App", "Payment"],
    slug: "ecommerce-platform"
  },
  {
    title: "Shopify Storefront Builder",
    description: "Custom Shopify storefront builder with advanced customization options.",
    image: "/project-logistics.png",
    tags: ["Shopify", "E-commerce", "Builder"],
    slug: "shopify-builder"
  },
  {
    title: "AI Powered Documents",
    description: "Smart document processing system with AI integration.",
    image: "/project-ai.png",
    tags: ["AI", "Documents", "Automation"],
    slug: "ai-documents"
  }
];

export default function Work() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative text-center px-4"
        >
          <h1 className="text-4xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Our Latest</span>
            <br />
            <span className="text-white">Creations</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We build scalable applications that power businesses generating over $300 million in value.
          </p>
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {/* ERP Project */}
            <div className="group cursor-pointer md:mt-0">
              <Link href="/work/erp-manufacturing">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    ERP for Wood Shop
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Complex eCommerce Store */}
            <div className="group cursor-pointer md:mt-24">
              <Link href="/work/ecommerce-platform">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Complex eCommerce Store
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Shopify Storefront Builder */}
            <div className="group cursor-pointer md:mt-0">
              <Link href="/work/shopify-builder">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Shopify Storefront Builder
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* AI Powered Documents */}
            <div className="group cursor-pointer md:mt-24">
              <Link href="/work/ai-documents">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    AI Powered Documents
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ConsultationCTA />
      <Footer />
    </main>
  );
} 