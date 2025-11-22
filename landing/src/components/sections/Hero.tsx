"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";

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
      {/* Background image with top white fade */}
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
          way to grow plants
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
            href="https://dev.dn03fv11bz1ey.amplifyapp.com/"
            className="rounded-full border border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--background)] font-[var(--font-secondary)] px-10 md:px-14 py-2 text-sm md:text-base transition-all duration-300 hover:bg-[var(--background)] hover:text-[var(--color-font)] hover:border-[var(--foreground)]"
          >
            Get Started
          </Link>

          <Link
            href="#footer"
            className="rounded-full border border-[var(--foreground)] bg-[var(--background)] text-[var(--color-font)] font-[var(--font-secondary)] px-10 md:px-14 py-2 text-sm md:text-base transition-all duration-300 hover:bg-[var(--foreground)] hover:text-[var(--background)]"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
