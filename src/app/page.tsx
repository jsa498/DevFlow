import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

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
      <section className="section pt-32 md:pt-40 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Your Ideas Into
            <span className="gradient-text"> Digital Reality</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            We craft innovative software solutions that drive business growth and enhance user experience
          </p>
          <div className="flex justify-center gap-4">
            <a href="/contact" className="btn-primary">
              Start Your Project
            </a>
            <a href="/services" className="btn-outline">
              Explore Services
            </a>
          </div>
        </motion.div>

        {/* Animated Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl -z-10 animate-float" />
      </section>

      {/* Services Section */}
      <section className="section bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
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
              className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}
