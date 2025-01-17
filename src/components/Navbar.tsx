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
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-[720px]"
    >
      <nav className="mx-4">
        <div className="bg-black rounded-full shadow-lg backdrop-blur-sm px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/DevLogo.png"
                alt="DevFlow Logo"
                width={32}
                height={32}
                className="w-8 h-8"
                priority
              />
            </Link>

            <div className="flex items-center space-x-8">
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
                className="text-white bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-full hover:from-blue-600 hover:to-blue-700 transition-all"
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