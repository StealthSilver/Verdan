"use client";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Calendar, Droplets, Sun, Bell, TrendingUp, Heart } from "lucide-react";

const Features = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Calendar,
      title: "Care Calendar",
      description:
        "Visual calendar showing all your plant care tasks at a glance",
    },
    {
      icon: Droplets,
      title: "Watering Tracker",
      description: "Log watering sessions and track moisture levels over time",
    },
    {
      icon: Sun,
      title: "Light Monitor",
      description: "Ensure your plants get the perfect amount of sunlight",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Timely notifications for watering, fertilizing, and more",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      description: "Track your plants' progress with detailed growth charts",
    },
    {
      icon: Heart,
      title: "Plant Journal",
      description: "Document memories and milestones with photo journals",
    },
  ];

  return (
    <section
      id="features"
      ref={ref}
      className="py-24 bg-gradient-to-b from-secondary/20 to-background"
    >
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            Everything You Need to <span className="text-primary">Thrive</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            Powerful features designed to make plant care simple, effective, and
            enjoyable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                className="group"
              >
                <div className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-glow transition-all duration-300 h-full border border-border/50 hover:border-primary/30">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
