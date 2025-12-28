"use client";

import { motion } from "framer-motion";
import { Camera, BarChart3, Users, Leaf, Lock, Clock } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Camera,
      title: "Photo Documentation",
      description:
        "Capture and store visual evidence of each tree at different growth stages with timestamped photos",
      color: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Visualize tree health metrics, growth trends, and environmental impact in comprehensive dashboards",
      color: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      icon: Users,
      title: "Team Management",
      description:
        "Collaborate with team members, assign roles, and manage permissions across projects",
      color: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: Leaf,
      title: "Tree Health Tracking",
      description:
        "Monitor vital metrics like height, leaf count, pest status, and overall health indicators",
      color: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      icon: Lock,
      title: "Data Security",
      description:
        "Enterprise-grade security with encrypted data storage and privacy-first architecture",
      color: "bg-red-50",
      iconColor: "text-red-600",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description:
        "Get instant notifications and live updates on tree status changes and milestones",
      color: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section
      id="features"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-[var(--background)] text-[var(--color-font)] overflow-hidden transition-colors duration-500"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-0 w-80 h-80 bg-green-50 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16 md:mb-20"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-semibold leading-tight mb-4 sm:mb-6">
            Powerful Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-sans opacity-80 max-w-3xl mx-auto">
            Everything you need to manage, monitor, and grow your forest with
            complete transparency
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                className={`group relative p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer border border-gray-100 hover:border-green-300 ${feature.color}`}
                variants={itemVariants}
                whileHover={{ y: -8 }}
              >
                {/* Icon Container */}
                <div className="mb-4 sm:mb-6 inline-block p-3 sm:p-4 rounded-lg bg-white/60 backdrop-blur">
                  <Icon
                    className={`w-6 h-6 sm:w-8 sm:h-8 ${feature.iconColor}`}
                  />
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-heading font-semibold mb-3 sm:mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base font-sans opacity-75 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover indicator */}
                <div className="absolute inset-0 rounded-2xl border border-green-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          className="mt-16 sm:mt-20 md:mt-24 p-8 sm:p-12 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl">
            <h3 className="text-2xl sm:text-3xl font-heading font-semibold mb-4 sm:mb-6">
              Why Choose Our Features?
            </h3>
            <p className="text-base sm:text-lg font-sans opacity-80 mb-4 sm:mb-6 leading-relaxed">
              Our feature set is specifically designed for organizations serious
              about tree planting impact. We combine ease of use with powerful
              capabilities to ensure your data works as hard as you do.
            </p>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></span>
                <span className="text-sm sm:text-base opacity-75">
                  Built by environmental professionals
                </span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></span>
                <span className="text-sm sm:text-base opacity-75">
                  Trusted by thousands of tree-planting organizations
                </span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></span>
                <span className="text-sm sm:text-base opacity-75">
                  Regular updates and new features based on user feedback
                </span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
