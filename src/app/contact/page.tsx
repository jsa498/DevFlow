'use client';

import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const services = [
  "Custom Website Development",
  "Custom Software Development",
  "Mobile App Development",
  "API Development & Integration",
  "E-commerce Solutions",
  "UI/UX Design",
  "Cloud Computing Services",
  "Enterprise Software",
  "Data Analytics",
  "DevOps & Automation",
];

export default function Contact() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="section pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            Let&apos;s Connect
          </h1>

          <div className="bg-white rounded-xl shadow-lg p-6 md:p-10">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which of our services are you looking for?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <label
                      key={service}
                      className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="services"
                        value={service}
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="ml-3 text-sm">{service}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="johndoe@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                  placeholder="Your Company Ltd."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us more about your project
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors h-32"
                  placeholder="We are reaching out to discuss about a project that..."
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary flex items-center justify-center"
              >
                Submit
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      <Footer />
    </main>
  );
} 