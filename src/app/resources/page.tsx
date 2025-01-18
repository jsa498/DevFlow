'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';

export default function Resources() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-black text-white">
      <Navbar />
      <div className="w-full max-w-2xl mx-auto text-center mt-32 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <Image
              src="/globe.svg"
              alt="Resources"
              width={80}
              height={80}
              className="mx-auto opacity-80"
            />
          </motion.div>
          
          <motion.h1
            className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            Coming Soon
          </motion.h1>
          
          <motion.p
            className="text-lg sm:text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            We're crafting valuable resources and products to help you build amazing digital experiences.
            Stay tuned for updates!
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            <Link 
              href="/contact"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full transition-colors duration-300"
            >
              Get Notified
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 