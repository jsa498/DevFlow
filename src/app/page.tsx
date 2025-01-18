'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useRef } from 'react';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';

export default function Home() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Smoother, continuous animations
  const translateX1 = useTransform(scrollYProgress,
    [0, 1],
    ['-200%', '200%']
  );
  const translateX2 = useTransform(scrollYProgress,
    [0, 1],
    ['200%', '-200%']
  );
  const opacity = useTransform(scrollYProgress, 
    [0.1, 0.2, 0.8, 0.9], 
    [0, 1, 1, 0]
  );

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-black text-white">
      <Navbar />
      
      {/* Hero Video Section - Adjusted mobile spacing */}
      <section className="relative h-[85vh] sm:h-screen w-full flex flex-col justify-end pb-8 sm:pb-16">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain md:object-cover"
            style={{ filter: 'brightness(0.85) contrast(1.1)', backgroundColor: 'black' }}
          >
            <source src="/DevFlow.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
        </div>

        {/* Call to Action Buttons - Reduced bottom margin on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 px-4 sm:px-6 w-full sm:w-auto max-w-[300px] sm:max-w-none mx-auto mb-4 sm:mb-0"
        >
          <Link 
            href="/contact" 
            className="bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transform duration-200 text-center"
          >
            Start Your Project
          </Link>
          <Link 
            href="/work" 
            className="border-2 border-white/80 bg-black/20 backdrop-blur-sm text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium hover:bg-white/20 hover:border-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform duration-200 text-center"
          >
            Our Work
          </Link>
        </motion.div>
      </section>

      {/* Animated Text Section - Adjusted height and spacing */}
      <section 
        ref={sectionRef}
        className="relative bg-black min-h-[60vh] sm:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-6 sm:py-20"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4">
          {/* First Line */}
          <motion.div
            className="relative flex items-start mb-2 sm:mb-8"
            style={{ 
              translateX: translateX1,
              opacity 
            }}
          >
            <span className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80 leading-none whitespace-nowrap tracking-tight"
                  style={{ 
                    textShadow: '0 0 40px rgba(255,255,255,0.2)',
                    fontFamily: "'Clash Display', sans-serif"
                  }}>
              You Dream
            </span>
          </motion.div>

          {/* Second Line */}
          <motion.div
            className="relative flex items-end justify-end"
            style={{ 
              translateX: translateX2,
              opacity 
            }}
          >
            <span className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white/80 via-white/90 to-white leading-none whitespace-nowrap tracking-tight"
                  style={{ 
                    textShadow: '0 0 40px rgba(255,255,255,0.2)',
                    fontFamily: "'Clash Display', sans-serif"
                  }}>
              We Build
            </span>
          </motion.div>
        </div>
      </section>

      {/* Work Section - Thind.dev Style */}
      <section className="min-h-screen w-full bg-black pt-32 pb-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-32">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 lg:mb-0" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Our Work
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-[400px] mt-4">
              We have built scalable applications that are the backbone of businesses generating over $300 million in market value.
            </p>
          </div>

          {/* Project Grid - Staggered Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-32">
            {/* ERP Project */}
            <div className="group cursor-pointer md:mt-0">
              <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[#111111]"></div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  ERP for Wood Shop
                </h3>
                <div className="bg-zinc-900/50 rounded-full p-3 group-hover:translate-x-2 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Complex eCommerce Store */}
            <div className="group cursor-pointer md:mt-32">
              <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[#111111]"></div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Complex eCommerce Store
                </h3>
                <div className="bg-zinc-900/50 rounded-full p-3 group-hover:translate-x-2 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Shopify Storefront Builder */}
            <div className="group cursor-pointer md:mt-0">
              <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[#111111]"></div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  Shopify Storefront Builder
                </h3>
                <div className="bg-zinc-900/50 rounded-full p-3 group-hover:translate-x-2 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* AI Powered Documents */}
            <div className="group cursor-pointer md:mt-32">
              <div className="relative w-full aspect-[4/3] bg-zinc-900 rounded-2xl overflow-hidden mb-6">
                <div className="absolute inset-0 bg-[#111111]"></div>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl md:text-3xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                  AI Powered Documents
                </h3>
                <div className="bg-zinc-900/50 rounded-full p-3 group-hover:translate-x-2 transition-transform">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Preview Section */}
      <section className="py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">Resources</h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Coming Soon - Stay tuned for helpful tools and resources
              </p>
            </motion.div>
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
