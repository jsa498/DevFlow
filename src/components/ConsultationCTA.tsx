'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ConsultationCTA() {
  return (
    <section className="py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-12 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent" />
          
          <div className="relative">
            <div className="text-sm text-gray-400 mb-4">1hr support consultation</div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Let&apos;s Connect</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Have an idea, a question, or need guidance? We&apos;re here to help!
              Schedule a free 1-hour consultation.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
                <svg
                  className="ml-2 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
} 