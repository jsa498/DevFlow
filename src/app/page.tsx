'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

const services = [
  {
    title: "Custom Website Development",
    description: "Modern, responsive websites built with cutting-edge technologies",
  },
  {
    title: "Custom Software Development",
    description: "Tailored software solutions to meet your unique business needs",
  },
  {
    title: "Mobile App Development",
    description: "Native and cross-platform mobile applications",
  },
  {
    title: "API Development & Integration",
    description: "Robust APIs and seamless third-party integrations",
  },
  {
    title: "E-commerce Solutions",
    description: "Scalable online stores and marketplace platforms",
  },
  {
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces that users love",
  },
  {
    title: "Cloud Computing Services",
    description: "Cloud-native solutions and infrastructure management",
  },
  {
    title: "Enterprise Software",
    description: "Large-scale applications for enterprise needs",
  },
  {
    title: "Data Analytics",
    description: "Business intelligence and data visualization solutions",
  },
  {
    title: "DevOps & Automation",
    description: "Streamlined development and deployment processes",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto pt-20"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/DevLogo.png"
              alt="DevFlow Logo"
              width={80}
              height={80}
              className="w-20 h-20 animate-float"
              priority
            />
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Transform Your Ideas Into
            <div className="gradient-text">Digital Reality</div>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            We craft innovative software solutions that drive business growth and enhance user experience
          </p>
          <div className="flex justify-center gap-6">
            <Link 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Your Project
            </Link>
            <Link 
              href="/services" 
              className="border-2 border-gray-200 text-gray-800 px-8 py-4 rounded-full text-lg font-medium hover:border-blue-600 hover:text-blue-600 transition-colors"
            >
              Explore Services
            </Link>
          </div>
        </motion.div>

        {/* Animated Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl -z-10 animate-float" />
      </section>

      {/* Services Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive software development solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
