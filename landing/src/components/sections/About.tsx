"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
// Image imports use relative paths because the project's tsconfig maps '@' to './src',
// and the 'assets' directory currently lives at the project root (../../.. /assets).
// If you move 'assets' into 'src/assets', you can revert to '@/assets/...'.
import aboutPlant from "../../../assets/about-plant-1.png";
import aboutWater from "../../../assets/about-water.png";
import aboutApp from "../../../assets/about-app.png";

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      image: aboutPlant,
      title: "Track Every Plant",
      description:
        "Keep detailed profiles for each of your plants with photos, care schedules, and growth history.",
    },
    {
      image: aboutWater,
      title: "Smart Reminders",
      description:
        "Never miss a watering day. Get personalized notifications based on each plant's unique needs.",
    },
    {
      image: aboutApp,
      title: "Expert Insights",
      description:
        "Access plant care guides, troubleshooting tips, and seasonal recommendations all in one place.",
    },
  ];

  return (
    <section
      id="about"
      ref={ref}
      className="py-24 bg-gradient-to-b from-background to-secondary/20"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            What is <span className="text-primary">Verdan?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Your all-in-one plant care companion that helps you grow healthier,
            happier plants through smart tracking and personalized guidance.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group"
            >
              <div className="bg-card rounded-3xl p-8 shadow-soft hover:shadow-glow transition-all duration-300 h-full flex flex-col items-center text-center space-y-6">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  className="w-24 h-24 object-contain"
                />
              </div>
              <h3 className="text-2xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
