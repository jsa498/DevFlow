'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';

const projects = [
  {
    title: "ERP for Manufacturing",
    description: "Custom ERP solution for a manufacturing company with inventory tracking and production management.",
    image: "/project-erp.png",
    tags: ["Web App", "ERP", "Manufacturing"],
    slug: "erp-manufacturing"
  },
  {
    title: "E-commerce Platform",
    description: "Full-featured e-commerce platform with inventory management and payment processing.",
    image: "/project-ecommerce.png",
    tags: ["E-commerce", "Web App", "Payment Integration"],
    slug: "ecommerce-platform"
  },
  {
    title: "Logistics Dashboard",
    description: "Real-time logistics tracking and management system for a shipping company.",
    image: "/project-logistics.png",
    tags: ["Dashboard", "Real-time", "Analytics"],
    slug: "logistics-dashboard"
  }
];

export default function Work() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
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
            <span className="text-purple-400">Some of our latest</span>
            <br />
            <span className="text-white">creations</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            We have built scalable applications that are the backbone of businesses generating over $300 million in market value.
          </p>
        </motion.div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-24">
            {projects.map((project, index) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/work/${project.slug}`}>
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1a1a1a]">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    </div>
                    <div className={`space-y-4 ${index % 2 === 1 ? 'md:order-1 md:text-right' : ''}`}>
                      <h2 className="text-2xl md:text-3xl font-bold">{project.title}</h2>
                      <div className={`flex gap-2 flex-wrap ${index % 2 === 1 ? 'md:justify-end' : ''}`}>
                        {project.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-400">
                        {project.description}
                      </p>
                      <div className={`flex items-center gap-2 ${index % 2 === 1 ? 'md:justify-end' : ''}`}>
                        <motion.div
                          whileHover={{ x: index % 2 === 1 ? -10 : 10 }}
                          className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#2a2a2a] transition-colors"
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className={index % 2 === 1 ? 'rotate-180' : ''}
                          >
                            <path
                              d="M5 12H19M19 12L12 5M19 12L12 19"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <ConsultationCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
} 