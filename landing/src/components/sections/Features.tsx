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
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Visualize tree health metrics, growth trends, and environmental impact in comprehensive dashboards",
    },
    {
      icon: Users,
      title: "Team Management",
      description:
        "Collaborate with team members, assign roles, and manage permissions across projects",
    },
    {
      icon: Leaf,
      title: "Tree Health Tracking",
      description:
        "Monitor vital metrics like height, leaf count, pest status, and overall health indicators",
    },
    {
      icon: Lock,
      title: "Data Security",
      description:
        "Enterprise-grade security with encrypted data storage and privacy-first architecture",
    },
    {
      icon: Clock,
      title: "Real-Time Updates",
      description:
        "Get instant notifications and live updates on tree status changes and milestones",
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
        <div
          className="absolute top-20 left-0 w-80 h-80 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: "rgba(74, 137, 92, 0.15)" }}
        ></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: "rgba(74, 137, 92, 0.3)" }}
        ></div>
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
          <h2 className="text-sm sm:text-base md:text-lg font-heading font-light tracking-widest leading-tight mb-4 sm:mb-6 opacity-50 uppercase">
            Features
          </h2>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-medium mb-6 sm:mb-8">
            Powerful Features
          </h3>
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
                className="group relative p-6 sm:p-8 rounded-2xl transition-all duration-300 cursor-pointer border bg-white/40 backdrop-blur hover:shadow-xl hover:bg-white/60"
                style={{
                  borderColor: "rgb(200, 200, 200)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgb(74, 137, 92)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgb(200, 200, 200)";
                }}
                variants={itemVariants}
              >
                {/* Icon Container with animation */}
                <motion.div
                  className="mb-4 sm:mb-6 inline-block p-3 sm:p-4 rounded-lg border transition-colors duration-300"
                  style={{
                    backgroundColor: "rgba(74, 137, 92, 0.15)",
                    borderColor: "rgba(74, 137, 92, 0.3)",
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Icon
                    className="w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-300"
                    style={{ color: "rgb(74, 137, 92)" }}
                  />
                </motion.div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-heading font-semibold mb-3 sm:mb-4 transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base font-sans opacity-70 leading-relaxed group-hover:opacity-85 transition-opacity duration-300">
                  {feature.description}
                </p>

                {/* Animated border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    borderColor: "rgb(74, 137, 92)",
                    borderWidth: "1px",
                  }}
                  initial={{ pathLength: 0 }}
                  whileHover={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                ></motion.div>

                {/* Subtle shine effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                  style={{ pointerEvents: "none" }}
                ></motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
