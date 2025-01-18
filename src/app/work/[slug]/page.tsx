import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

// This would typically come from a CMS or database
const projectData = {
  'erp-manufacturing': {
    title: "ERP for Manufacturing",
    tags: ["App Design", "Web Design", "Web App", "Maintenance"],
    clientNeeds: "A manufacturing company wanted to expand by reducing costs while maintaining quality. They aimed to transform their operations into a faster production line but faced bottlenecks due to the lack of affordable, user-friendly ERP software.",
    features: [
      {
        title: "Powerful Web App",
        description: "We made an app with intuitive interface that enables easy navigation for all team members. Our bespoke ERP tracks inventory, creates manufacturing orders, schedules tasks, and manages production workflow."
      },
      {
        title: "Manufacturing Module",
        description: "App tracks worker hours, material usage, and even the smallest details. This precision is essential for calculating the cost of each unique product, ensuring both efficiency and quality standards."
      },
      {
        title: "Inventory Module",
        description: "Inventory Module tracks the journey of materials from raw state to finished product. This module records when items are received, their usage in projects, and maintains a clear link to the original materials."
      }
    ],
    result: "As a result, we developed a custom in-house ERP featuring bespoke manufacturing and specialized inventory tracking. This user-friendly system enables precise tracking of hours, materials, and costs for each unique piece. The inventory module ensures complete traceability from raw materials to finished products, streamlining production and reducing costs."
  },
  // Add other projects here
};

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ProjectPage({ params, searchParams }: Props) {
  const project = projectData[params.slug as keyof typeof projectData];
  
  if (!project) return <div>Project not found</div>;

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-white">
      <Navbar />
      
      {/* Project Header */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="opacity-0 translate-y-5 animate-[fadeIn_0.5s_ease-out_forwards]"
          >
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="px-4 py-1 bg-white/10 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{project.title}</h1>
          </div>
        </div>
      </section>

      {/* Client Needs */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div
            className="opacity-0 translate-y-5 animate-[fadeIn_0.5s_ease-out_forwards]"
          >
            <h2 className="text-3xl font-bold mb-8">What client was looking for</h2>
            <p className="text-gray-400 text-lg max-w-3xl">
              {project.clientNeeds}
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-16"
          >
            The product we built
          </motion.h2>
          <div className="space-y-32">
            {project.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="grid md:grid-cols-2 gap-8 items-center"
              >
                <div className="order-2 md:order-none">
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
                <div className="relative aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden order-1 md:order-none">
                  {/* Placeholder for feature image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Result */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-purple-900/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8">Result</h2>
            <p className="text-gray-400 text-lg max-w-3xl">
              {project.result}
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
} 