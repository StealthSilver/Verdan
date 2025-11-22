"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import GrowingTreeAnimation from "../ui/GrowingTreeAnimation";
// Image imports use relative paths because the project's tsconfig maps '@' to './src'.
import aboutPlant from "../../../assets/about-plant-1.png";
import aboutWater from "../../../assets/about-water.png";
import aboutApp from "../../../assets/about-app.png";

const features = [
  {
    image: aboutPlant,
    title: "Track Every Plant",
    description:
      "Keep detailed profiles with photos, care schedules, and growth history so nothing gets forgotten.",
  },
  {
    image: aboutWater,
    title: "Smart Reminders",
    description:
      "Personalized watering & care notifications tuned to each plant’s unique rhythm.",
  },
  {
    image: aboutApp,
    title: "Expert Insights",
    description:
      "Seasonal tips, diagnostics, and guides all in one evolving knowledge base.",
  },
];

const About = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section
      id="about"
      className="max-w-7xl mx-auto relative py-28 bg-gradient-to-b from-background via-background/40 to-secondary/25 overflow-hidden"
    >
      {/* subtle background flair */}
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_center,white,transparent)]">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div ref={ref} className="container mx-auto px-6">
        <div className="grid items-center gap-16 lg:gap-24 md:grid-cols-2">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="space-y-5">
              <h2 className="text-5xl font-semibold tracking-tight text-balance leading-[1.15]">
                Grow with <span className="text-primary">Verdan</span>
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-prose text-balance">
                Verdan is your intelligent plant care companion—organizing every
                detail, surfacing timely actions, and helping you understand
                what your green friends truly need.
              </p>
            </div>
            <ul className="space-y-6">
              {features.map((f, i) => (
                <motion.li
                  key={f.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.25 + i * 0.12 }}
                  className="group flex gap-5 rounded-2xl p-4 pr-6 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-card shadow-sm ring-1 ring-border/50 group-hover:shadow-glow">
                    <Image
                      src={f.image}
                      alt={f.title}
                      className="h-12 w-12 object-contain"
                      draggable={false}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h3 className="text-lg font-semibold leading-tight">
                      {f.title}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Right Column: Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative mx-auto flex w-full max-w-md items-center justify-center"
            aria-hidden="true"
          >
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-tr from-primary/15 via-primary/5 to-secondary/20 blur-2xl" />
            <div className="rounded-3xl border border-border/40 bg-card/70 backdrop-blur-md shadow-lg p-8">
              <GrowingTreeAnimation />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
