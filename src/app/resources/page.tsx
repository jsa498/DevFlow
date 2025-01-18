'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';

export default function Resources() {
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
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Resources</span>
            <br />
            <span className="text-white">& Insights</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore our collection of resources designed to help you build better software.
          </p>
        </motion.div>
      </section>

      {/* Resources Grid */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {/* Coming Soon */}
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Coming Soon</h2>
              <p className="text-gray-400">
                We&apos;re working on creating valuable resources to help you build better software. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>

      <ConsultationCTA />
      <Footer />
    </main>
  );
} 