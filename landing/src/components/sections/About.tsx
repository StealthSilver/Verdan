"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const About = () => {
  const benefits = [
    {
      title: "Real-Time Tracking",
      description: "Monitor the health and growth of every tree with live data",
    },
    {
      title: "Photo Evidence",
      description:
        "Capture visual progress of each tree throughout its lifecycle",
    },
    {
      title: "Data Analytics",
      description:
        "Transform tree data into actionable insights and impact metrics",
    },
    {
      title: "Team Collaboration",
      description: "Work together seamlessly with your environmental team",
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
      id="about"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-[var(--background)] text-[var(--color-font)] overflow-hidden transition-colors duration-500"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-72 h-72 bg-green-50 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-green-50 rounded-full blur-3xl opacity-30"></div>
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
            About Verdan
          </h2>
          <p className="text-base sm:text-lg md:text-xl font-sans opacity-80 max-w-3xl mx-auto">
            We believe every tree matters. Verdan empowers organizations and
            individuals to plant with purpose, track with precision, and grow
            with impact.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center mb-16 sm:mb-20 md:mb-24">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-heading font-semibold mb-6 sm:mb-8">
              Why Verdan?
            </h3>
            <p className="text-base sm:text-lg font-sans opacity-80 mb-4 sm:mb-6 leading-relaxed">
              Traditional tree-planting efforts often lack transparency and
              accountability. Without proper tracking, it's difficult to measure
              the real impact of reforestation projects.
            </p>
            <p className="text-base sm:text-lg font-sans opacity-80 mb-8 sm:mb-12 leading-relaxed">
              Verdan solves this by providing a comprehensive platform where
              every tree is documented, monitored, and celebrated. From planting
              to growth milestones, your forest grows with full visibility.
            </p>

            {/* Benefits List */}
            <motion.div
              className="space-y-4 sm:space-y-5"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {benefits.slice(0, 2).map((benefit, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-3 sm:gap-4"
                  variants={itemVariants}
                >
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-heading font-semibold text-base sm:text-lg mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-sm sm:text-base opacity-70">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Image/Illustration */}
          <motion.div
            className="relative h-96 sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-green-100 to-green-50 shadow-lg"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/40 backdrop-blur flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl sm:text-6xl">🌱</span>
                </div>
                <p className="text-sm sm:text-base font-sans opacity-80 font-semibold">
                  Growing a healthier planet
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Benefits Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.slice(2).map((benefit, idx) => (
            <motion.div
              key={idx}
              className="p-6 sm:p-8 rounded-xl bg-white/50 backdrop-blur border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-lg"
              variants={itemVariants}
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <h4 className="font-heading font-semibold text-base sm:text-lg">
                  {benefit.title}
                </h4>
              </div>
              <p className="text-sm sm:text-base opacity-70 leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default About;
