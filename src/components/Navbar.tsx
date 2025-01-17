'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4"
    >
      <nav className="w-full max-w-[720px] mx-4">
        <div className="bg-black rounded-full shadow-lg backdrop-blur-sm h-16">
          <div className="flex items-center justify-between h-full px-4">
            <div className="flex-shrink-0 relative pt-4">
              <Image
                src="/DevLogo.png"
                alt="DevFlow Logo"
                width={104}
                height={104}
                className="w-28 h-28 transform -translate-y-0.3"
                priority
              />
            </div>

            <div className="hidden md:flex items-center space-x-8 ml-auto">
              <Link href="/services" className="text-white hover:text-blue-400 transition-colors">
                Services
              </Link>
              <Link href="/work" className="text-white hover:text-blue-400 transition-colors">
                Work
              </Link>
              <Link href="/resources" className="text-white hover:text-blue-400 transition-colors">
                Resources
              </Link>
              <Link 
                href="/contact" 
                className="text-white bg-blue-600 px-6 py-2 rounded-full hover:bg-blue-700 transition-all"
              >
                Let&apos;s Connect
              </Link>
            </div>

            <button className="md:hidden text-white">
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar; 