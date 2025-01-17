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
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-2 sm:pt-4 w-full"
    >
      <nav className="w-full max-w-[720px] mx-2 sm:mx-4 px-1">
        <div className="bg-black rounded-full shadow-lg backdrop-blur-sm h-14 sm:h-16 w-full">
          <div className="flex items-center justify-between h-full px-3 sm:px-4 relative">
            <div className="flex-shrink-0 relative pt-4 -ml-1 sm:ml-0">
              <Image
                src="/DevLogo.png"
                alt="DevFlow Logo"
                width={96}
                height={96}
                className="w-24 sm:w-28 h-24 sm:h-28 transform -translate-y-0.5"
                priority
              />
            </div>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 ml-auto">
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
                className="text-white bg-blue-600 px-5 sm:px-6 py-2 rounded-full hover:bg-blue-700 transition-all"
              >
                Let&apos;s Connect
              </Link>
            </div>

            <button className="md:hidden text-white p-2">
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