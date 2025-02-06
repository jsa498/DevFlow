'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useRef } from 'react';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';
import HeroScene from '@/components/HeroScene';
import StructuredData from '@/components/StructuredData';
import RainbowButton from '@/components/RainbowButton';

export default function Home() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
    layoutEffect: false
  });

  const translateX1 = useTransform(scrollYProgress,
    [0, 1],
    ['-200%', '200%'],
    {
      clamp: false
    }
  );
  const translateX2 = useTransform(scrollYProgress,
    [0, 1],
    ['200%', '-200%'],
    {
      clamp: false
    }
  );
  const opacity = useTransform(scrollYProgress, 
    [0.1, 0.2, 0.8, 0.9], 
    [0, 1, 1, 0],
    {
      clamp: true
    }
  );

  const organizationData = {
    name: 'DevFlow',
    url: 'https://devflow.ca',
    logo: 'https://devflow.ca/DevLogo.png',
    description: 'Expert software development services including web development, mobile apps, API integration, and enterprise solutions.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vancouver',
      addressRegion: 'BC',
      addressCountry: 'CA'
    },
    sameAs: [
      'https://linkedin.com/company/devflow',
      'https://github.com/devflow'
    ]
  };

  const websiteData = {
    name: 'DevFlow',
    url: 'https://devflow.ca',
    description: 'Expert software development services including web development, mobile apps, API integration, and enterprise solutions.',
    potentialAction: {
      '@type': 'SearchAction',
      'target': 'https://devflow.ca/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden text-white relative bg-transparent">
      <StructuredData type="Organization" data={organizationData} />
      <StructuredData type="WebSite" data={websiteData} />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen w-full flex flex-col justify-end pb-16 sm:pb-24">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden hero-blend-bottom">
          <HeroScene />
        </div>
        
        <div className="relative z-10 flex flex-row justify-center gap-3 px-3 w-full max-w-[360px] sm:max-w-[500px] mx-auto mb-8 sm:mb-0">
          <RainbowButton
            href="/contact"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Start Your Project
          </RainbowButton>
          <RainbowButton
            href="/work"
            className="text-sm sm:text-base whitespace-nowrap"
          >
            Our Work
          </RainbowButton>
        </div>
      </section>

      {/* Animated Text Section */}
      <section 
        ref={sectionRef}
        className="relative bg-black min-h-[60vh] sm:min-h-[80vh] flex flex-col items-center justify-center overflow-hidden py-6 sm:py-20"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4">
          <motion.div
            className="relative flex items-start mb-2 sm:mb-8"
            style={{ 
              translateX: translateX1,
              opacity,
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          >
            <span 
              className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/80 leading-none whitespace-nowrap tracking-tight"
              style={{ 
                textShadow: '0 0 40px rgba(255,255,255,0.2)',
                fontFamily: "'Clash Display', sans-serif"
              }}
            >
              You Dream
            </span>
          </motion.div>

          <motion.div
            className="relative flex items-end justify-end"
            style={{ 
              translateX: translateX2,
              opacity,
              willChange: 'transform',
              transform: 'translateZ(0)'
            }}
          >
            <span 
              className="text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white/80 via-white/90 to-white leading-none whitespace-nowrap tracking-tight"
              style={{ 
                textShadow: '0 0 40px rgba(255,255,255,0.2)',
                fontFamily: "'Clash Display', sans-serif"
              }}
            >
              We Build
            </span>
          </motion.div>
        </div>
      </section>

      {/* Work Section */}
      <section className="min-h-screen w-full bg-black pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-24">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8 lg:mb-0" style={{ fontFamily: "'Clash Display', sans-serif" }}>
              Our Work
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-[400px] mt-4">
              We have built scalable applications that are the backbone of businesses generating over $300 million in market value.
            </p>
          </div>

          {/* Project Grid - Staggered Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            {/* ERP Project */}
            <div className="group cursor-pointer md:mt-0">
              <Link href="/work/erp-manufacturing">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    ERP for Wood Shop
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Complex eCommerce Store */}
            <div className="group cursor-pointer md:mt-24">
              <Link href="/work/ecommerce-platform">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Complex eCommerce Store
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* Shopify Storefront Builder */}
            <div className="group cursor-pointer md:mt-0">
              <Link href="/work/shopify-builder">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    Shopify Storefront Builder
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
            </div>

            {/* AI Powered Documents */}
            <div className="group cursor-pointer md:mt-24">
              <Link href="/work/ai-documents">
                <div className="relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-5">
                  <div className="absolute inset-0 bg-[#111111]"></div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl md:text-2xl text-white font-medium" style={{ fontFamily: "'Clash Display', sans-serif" }}>
                    AI Powered Documents
                  </h3>
                  <div className="bg-zinc-900/50 rounded-full p-2.5 group-hover:translate-x-2 transition-transform">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"/>
                    </svg>
                  </div>
                </div>
              </Link>
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

      <ConsultationCTA />
      <Footer />
    </main>
  );
}
