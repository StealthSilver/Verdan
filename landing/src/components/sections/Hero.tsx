"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
      className={`
        relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden
        text-[var(--color-font)] transition-colors duration-500
        ${isDark ? "bg-neutral-900" : "bg-white"}
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/90 via-transparent to-transparent dark:from-yellow-500/40" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-[var(--font-primary)] leading-tight">
          Fastest and most efficient
        </h1>
        <h2 className="text-4xl md:text-6xl font-[var(--font-primary)] leading-tight mt-2">
          way to grow plants
        </h2>

        <p className="md:text-xl text-base font-[var(--font-secondary)] mt-8 text-[var(--color-font)] opacity-90">
          With Verdan, you can record, photograph, and follow the
        </p>
        <p className="md:text-xl text-base font-[var(--font-secondary)] mt-1 text-[var(--color-font)] opacity-90">
          life of every tree — turning data into a forest of impact.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center pt-12 gap-4 md:gap-12">
          <Link
            href="https://dev.dn03fv11bz1ey.amplifyapp.com/"
            className="
              rounded-full border border-[var(--color-primary)]
              bg-[var(--color-primary)] text-[var(--background)]
              font-[var(--font-secondary)]
              px-10 md:px-14 py-2 text-sm md:text-base
              transition-all duration-300
              hover:bg-[var(--background)] hover:text-[var(--color-font)] hover:border-[var(--foreground)]
            "
          >
            Get Started
          </Link>

          <Link
            href="#footer"
            className="
              rounded-full border border-[var(--foreground)]
              bg-[var(--background)] text-[var(--color-font)]
              font-[var(--font-secondary)]
              px-10 md:px-14 py-2 text-sm md:text-base
              transition-all duration-300
              hover:bg-[var(--foreground)] hover:text-[var(--background)]
            "
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
