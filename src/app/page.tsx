'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

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
  return (
    <main className="min-h-screen w-full overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] w-full flex items-center justify-center px-4 py-12 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center w-full max-w-4xl mx-auto pt-16 md:pt-20"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 tracking-tight px-4 sm:px-0 break-words">
            Transform Your Ideas Into
            <div className="gradient-text">Digital Reality</div>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 md:mb-12 max-w-2xl mx-auto px-4 sm:px-6">
            We craft innovative software solutions that drive business growth and enhance user experience
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4 w-full max-w-lg mx-auto">
            <Link 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-3 sm:py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto text-center"
            >
              Start Your Project
            </Link>
            <Link 
              href="/services" 
              className="border-2 border-gray-200 text-gray-800 px-8 py-3 sm:py-4 rounded-full text-lg font-medium hover:border-blue-600 hover:text-blue-600 transition-colors w-full sm:w-auto text-center"
            >
              Explore Services
            </Link>
          </div>
        </motion.div>

        {/* Animated Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] sm:w-[800px] h-[800px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10 animate-float" />
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
