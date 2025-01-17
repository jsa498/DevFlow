'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-gray-200"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/DevLogo.png"
              alt="DevFlow Logo"
              width={40}
              height={40}
              className="w-auto h-8"
              priority
            />
            <span className="text-2xl font-bold gradient-text">DevFlow</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/services" className="nav-link">
              Services
            </Link>
            <Link href="/work" className="nav-link">
              Work
            </Link>
            <Link href="/resources" className="nav-link">
              Resources
            </Link>
            <Link 
              href="/contact" 
              className="btn-primary"
            >
              Let&apos;s Connect
            </Link>
          </div>

          <button className="md:hidden">
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
      </nav>
    </motion.header>
  );
};

export default Navbar; 