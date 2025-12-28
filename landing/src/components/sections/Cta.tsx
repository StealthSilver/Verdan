"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const Cta = () => {
  return (
    <section
      id="cta"
      className="relative w-full py-16 sm:py-20 md:py-24 lg:py-32 bg-[var(--background)] text-[var(--color-font)] overflow-hidden transition-colors duration-500"
    >
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-40 animate-pulse"
          style={{ backgroundColor: "rgba(74, 137, 92, 0.3)" }}
        ></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: "rgba(74, 137, 92, 0.15)" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-transparent opacity-50"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Card */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-6 sm:mb-8 border"
            style={{
              backgroundColor: "rgba(74, 137, 92, 0.1)",
              borderColor: "rgba(74, 137, 92, 0.3)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Sparkles
              className="w-4 h-4 sm:w-5 sm:h-5"
              style={{ color: "rgb(74, 137, 92)" }}
            />
            <span
              className="text-xs sm:text-sm font-semibold"
              style={{ color: "rgb(74, 137, 92)" }}
            >
              Ready to make an impact?
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-semibold leading-tight mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Start Planting with Purpose Today
          </motion.h2>

          {/* Description */}
          <motion.p
            className="text-base sm:text-lg md:text-xl font-sans opacity-80 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of organizations using Verdan to track, measure, and
            celebrate their tree-planting impact. Get started free today.
          </motion.p>

          {/* Buttons Container */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Primary Button */}
            <Link
              href="https://verdan-beige.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto group relative px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-black text-white font-heading font-semibold text-sm sm:text-base transition-all duration-300 hover:shadow-2xl overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>

              <span className="relative flex items-center justify-center">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>

            {/* Secondary Button */}
            <Link
              href="#about"
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-black text-black hover:bg-black hover:text-white font-heading font-semibold text-sm sm:text-base transition-all duration-300"
            >
              Learn More
            </Link>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            className="mt-12 sm:mt-16 md:mt-20 pt-12 sm:pt-16 border-t border-gray-200"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-xs sm:text-sm opacity-60 mb-6 sm:mb-8 font-semibold uppercase tracking-wide">
              Trusted by leading organizations
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
              <div className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-heading font-bold mb-2"
                  style={{ color: "rgb(74, 137, 92)" }}
                >
                  1000+
                </div>
                <p className="text-xs sm:text-sm opacity-70 font-sans">
                  Trees planted and tracked
                </p>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-heading font-bold mb-2"
                  style={{ color: "rgb(74, 137, 92)" }}
                >
                  10+
                </div>
                <p className="text-xs sm:text-sm opacity-70 font-sans">
                  Organizations on Verdan
                </p>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl sm:text-4xl font-heading font-bold mb-2"
                  style={{ color: "rgb(74, 137, 92)" }}
                >
                  99.9%
                </div>
                <p className="text-xs sm:text-sm opacity-70 font-sans">
                  Data availability
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Cta;
