'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useRef } from 'react';

const services = [
  {
    title: "Custom Website Development",
    description: "Modern, responsive websites built with cutting-edge technologies",
    icon: "🌐",
  },
  {
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications",
    icon: "📱",
  },
  {
    title: "Cloud Solutions",
    description: "Scalable cloud infrastructure and solutions",
    icon: "☁️",
  },
];

const works = [
  {
    title: "Project 1",
    description: "Coming Soon",
    image: "/placeholder-project.jpg",
  },
  {
    title: "Project 2",
    description: "Coming Soon",
    image: "/placeholder-project.jpg",
  },
  {
    title: "Project 3",
    description: "Coming Soon",
    image: "/placeholder-project.jpg",
  },
];

export default function Home() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const x1 = useTransform(scrollYProgress, [0, 0.5], ['-100%', '0%']);
  const x2 = useTransform(scrollYProgress, [0, 0.5], ['100%', '0%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      
      {/* Hero Video Section */}
      <section className="relative h-screen w-full flex flex-col justify-end pb-16">
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.85) contrast(1.1)' }}
          >
            <source src="/DevFlow.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90" />
        </div>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 flex flex-col sm:flex-row justify-center gap-6 px-4"
        >
          <Link 
            href="/contact" 
            className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-500 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transform duration-200"
          >
            Start Your Project
          </Link>
          <Link 
            href="/services" 
            className="border-2 border-white/80 bg-black/20 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-white/20 hover:border-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transform duration-200"
          >
            Explore Services
          </Link>
        </motion.div>
      </section>

      {/* Animated Text Section */}
      <section 
        ref={sectionRef}
        className="relative bg-black min-h-screen flex flex-col items-center justify-center overflow-hidden py-20"
      >
        <div className="w-full max-w-[1400px] mx-auto px-4">
          {/* First Line */}
          <motion.div
            className="relative flex items-start mb-4 sm:mb-8"
            style={{ x: x1, opacity }}
          >
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold text-white leading-none whitespace-nowrap">
              Your Dream
            </span>
          </motion.div>

          {/* Second Line */}
          <motion.div
            className="relative flex items-end justify-end"
            style={{ x: x2, opacity }}
          >
            <span className="text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] font-bold text-white leading-none whitespace-nowrap">
              We Build
            </span>
          </motion.div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                Comprehensive software development solutions tailored to your needs
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <Link 
                  href="/services" 
                  className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Learn More →
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Work Preview Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Work</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Explore our latest projects and success stories
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {works.map((work, index) => (
              <motion.div
                key={work.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold mb-2">{work.title}</h3>
                  <p className="text-gray-600 mb-4">{work.description}</p>
                  <Link 
                    href="/work" 
                    className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Resources</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Coming Soon - Stay tuned for helpful tools and resources
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
