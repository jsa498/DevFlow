'use client';

import { motion } from 'framer-motion';
import { CodeBracketIcon, GlobeAltIcon, DevicePhoneMobileIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import Navbar from '@/components/Navbar';
import ConsultationCTA from '@/components/ConsultationCTA';
import Footer from '@/components/Footer';
import StructuredData from '@/components/StructuredData';

const services = [
  {
    title: "Custom Software Development",
    description: "End-to-end solutions tailored to your business needs",
    icon: CodeBracketIcon,
  },
  {
    title: "Web Applications",
    description: "Scalable, responsive web apps with modern architecture",
    icon: GlobeAltIcon,
  },
  {
    title: "Mobile Development",
    description: "Native and cross-platform mobile solutions",
    icon: DevicePhoneMobileIcon,
  },
  {
    title: "Cloud & DevOps",
    description: "Cloud-native solutions with CI/CD integration",
    icon: CloudArrowUpIcon,
  },
];

const process = [
  {
    stage: "Discovery",
    description: "Understanding your vision and requirements"
  },
  {
    stage: "Design",
    description: "Creating intuitive user experiences"
  },
  {
    stage: "Development",
    description: "Building with cutting-edge technology"
  },
  {
    stage: "Deployment",
    description: "Launching with confidence"
  }
];

export default function Services() {
  const servicesStructuredData = services.map((service) => ({
    '@type': 'Service',
    name: service.title,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: 'DevFlow',
      url: 'https://devflow.ca'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Canada'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Software Development Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            description: service.description
          }
        }
      ]
    }
  }));

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white overflow-hidden">
      {servicesStructuredData.map((data, index) => (
        <StructuredData key={index} type="Service" data={data} />
      ))}
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-400 to-blue-500 text-transparent bg-clip-text">
            From Concept to Code
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
            We transform complex ideas into elegant software solutions
          </p>
        </motion.div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-[rgba(20,20,22,0.8)] backdrop-blur-sm hover:bg-[rgba(30,30,32,0.8)] transition-all"
              >
                <service.icon className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                <p className="text-gray-400">{service.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 bg-[rgba(20,20,22,0.5)]">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-center mb-16"
          >
            Our Development Process
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {process.map((step, index) => (
              <motion.div
                key={step.stage}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-500 flex items-center justify-center text-2xl font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.stage}</h3>
                <p className="text-gray-400">{step.description}</p>
              </motion.div>
            ))}
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