'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import RainbowButton from '@/components/RainbowButton';

const navItems = [
  { name: 'Home', path: '/', mobileOnly: true },
  { name: 'Services', path: '/services' },
  { name: 'Work', path: '/work' },
  { name: 'Resources', path: '/resources' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleNavigation = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-1 sm:pt-4 w-full"
    >
      <nav className="w-full max-w-[720px] mx-2 sm:mx-4 px-1">
        <div className="bg-gradient-to-r from-black/95 via-black/90 to-black/95 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] h-12 sm:h-16 w-full hover:border-white/30 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300">
          <div className="flex items-center justify-between h-full px-3 sm:px-4 relative">
            <Link href="/" className="flex-shrink-0 relative pt-3 sm:pt-4 -ml-1 sm:ml-0" onClick={handleNavigation}>
              <Image
                src="/DevLogo.png"
                alt="DevFlow Logo"
                width={96}
                height={96}
                className="w-20 sm:w-28 h-20 sm:h-28 transform -translate-y-0.5"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 ml-auto">
              {navItems.filter(item => !item.mobileOnly).map((item) => (
                <Link 
                  key={item.path}
                  href={item.path} 
                  className="text-white/90 hover:text-white transition-colors font-medium"
                  onClick={handleNavigation}
                >
                  {item.name}
                </Link>
              ))}
              <RainbowButton
                href="/contact"
                className="text-sm px-5 py-2 h-9"
                onClick={handleNavigation}
              >
                Let's Connect
              </RainbowButton>
            </div>

            <button 
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-full transition-colors relative w-10 h-10 flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 h-5 relative">
                <motion.span
                  className="absolute top-0 left-0 w-full h-[2px] bg-white rounded-full origin-center"
                  animate={{ 
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 9 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute top-[9px] left-0 w-full h-[2px] bg-white rounded-full"
                  animate={{ 
                    opacity: isOpen ? 0 : 1,
                    x: isOpen ? 8 : 0
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full origin-center"
                  animate={{ 
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -9 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-0 right-0 md:hidden px-6"
            >
              <motion.div
                className="bg-gradient-to-b from-black/90 to-black/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 max-w-[400px] mx-auto"
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
              >
                <div className="flex flex-col p-6 space-y-3">
                  {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={handleNavigation}
                        className={`
                          px-6 py-2.5 text-base transition-all duration-300 rounded-full text-center
                          ${isActive 
                            ? 'text-black font-semibold bg-white/90 shadow-lg' 
                            : 'text-white hover:bg-white/10'
                          }
                        `}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                  <div className="flex justify-center pt-2">
                    <RainbowButton
                      href="/contact"
                      className="text-sm px-6 py-2 h-10 w-auto"
                      onClick={handleNavigation}
                    >
                      Let's Connect
                    </RainbowButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};

export default Navbar; 