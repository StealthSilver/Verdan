"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="product"
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-[var(--background)] px-4 pt-20 text-[var(--color-font)] transition-colors duration-500 sm:px-6 sm:pt-24 md:pt-28"
    >
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center text-center">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl lg:text-7xl">
          Fastest and most efficient
        </h1>
        <h2 className="mt-1 text-3xl font-semibold leading-tight sm:mt-3 sm:text-4xl md:text-5xl lg:text-7xl">
          way to plant trees
        </h2>

        <p className="mt-6 max-w-2xl text-base opacity-90 sm:mt-8 sm:text-lg md:text-xl">
          With Harit, you can record, photograph, and follow the
        </p>
        <p className="mt-1 max-w-2xl text-base opacity-90 sm:text-lg md:text-xl">
          life of every tree — turning data into a forest of impact.
        </p>

        <div className="flex w-full flex-col items-center justify-center gap-3 px-2 pt-8 sm:w-auto sm:flex-row sm:gap-4 sm:pt-12 md:gap-12">
          <Link
            href="https://verdan-beige.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center rounded-full border border-black bg-white px-3 py-2.5 text-xs font-semibold text-gray-900 shadow-glow transition-all duration-200 hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-black/40 sm:w-auto sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Get Started
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
