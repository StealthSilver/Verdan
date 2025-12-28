"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative w-full min-h-screen flex flex-col items-center justify-start pt-20 sm:pt-24 md:pt-28 overflow-hidden text-[var(--color-font)] bg-[var(--background)] transition-colors duration-500"
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
        {/* Animated hexagonal overlay */}

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
        {/* Dark theme overlay removed */}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center px-4 sm:px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-heading font-semibold leading-tight">
          Fastest and most efficient
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-semibold leading-tight mt-1 sm:mt-3">
          way to plant trees
        </h2>

        <p className="text-base sm:text-lg md:text-xl font-sans mt-6 sm:mt-8 opacity-90 max-w-2xl">
          With Verdan, you can record, photograph, and follow the
        </p>
        <p className="text-base sm:text-lg md:text-xl font-sans mt-1 opacity-90 max-w-2xl">
          life of every tree — turning data into a forest of impact.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center pt-8 sm:pt-12 gap-3 sm:gap-4 md:gap-12 w-full sm:w-auto px-2">
          <Link
            href="https://verdan-beige.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-white border border-black text-gray-900 hover:bg-black hover:text-white rounded-full px-3 sm:px-5 py-2 sm:py-2.5 shadow-glow group flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black/40 font-sans font-semibold text-xs sm:text-sm transition-all duration-200"
          >
            Get Started Free
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
