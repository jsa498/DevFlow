'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ConsultationCTA from '@/components/ConsultationCTA';

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
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Coming Soon - Stay tuned for helpful tools and resources
          </p>
        </motion.div>
      </section>

      <ConsultationCTA />
      <Footer />
    </main>
  );
} 