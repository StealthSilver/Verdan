"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
import { useTheme } from "next-themes";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <section
      id="home"
      className="relative w-full min-h-screen flex flex-col items-center justify-start pt-28 overflow-hidden text-[var(--color-font)] bg-[var(--background)] transition-colors duration-500"
    >
      {/* Background image with top + side white fades */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero_img.png"
          alt="Verdan platform growing a thriving forest"
          fill
          priority
          className="object-cover w-full h-full blur-[1px] scale-110"
        />
        {/* White fade overlay: top ~20% solid white, then gradual reveal */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, #ffffff 0%, #ffffff 18%, rgba(255,255,255,0.85) 26%, rgba(255,255,255,0.55) 34%, rgba(255,255,255,0.25) 42%, rgba(255,255,255,0) 50%)",
          }}
        />

        {/* Side fades (left & right) for subtle blending */}
        {/* Refined circular side fades (smaller & softer) */}

        {/* Bottom fade (10% height) for white lift */}
        <div
          aria-hidden
          className="absolute left-0 bottom-0 w-full pointer-events-none"
          style={{
            height: "16%",
            background:
              "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.5) 70%, rgba(255,255,255,0) 100%)",
          }}
        />
        {/* Optional subtle dark theme adjustment below fade for contrast */}
        {isDark && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0) 45%, rgba(0,0,0,0.25) 75%)",
              mixBlendMode: "multiply",
            }}
          />
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-[var(--font-primary)] leading-tight">
          Fastest and most efficient
        </h1>
        <h2 className="text-4xl md:text-6xl font-[var(--font-primary)] leading-tight mt-2">
          way to plant trees
        </h2>

        <p className="md:text-xl text-base font-[var(--font-secondary)] mt-8 opacity-90">
          With Verdan, you can record, photograph, and follow the
        </p>
        <p className="md:text-xl text-base font-[var(--font-secondary)] mt-1 opacity-90">
          life of every tree — turning data into a forest of impact.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center pt-12 gap-4 md:gap-12">
          <Link
            href="https://verdan-beige.vercel.app/"
            className="bg-white border border-black text-primary-foreground hover:bg-black hover:text-white rounded-full px-4 py-2 shadow-glow group flex items-center justify-center"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
