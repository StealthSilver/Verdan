"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";

const CTA = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section
      id="cta"
      className="relative overflow-hidden py-30 px-6 mt-10 flex flex-col items-center justify-center
                  mx-auto rounded-2xl text-center"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--color-font)",
        fontFamily: "var(--font-primary)",
      }}
    >
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
        aria-hidden="true"
      >
        <div
          className="w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, var(--glow-color) 0%, transparent 80%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-4">
        <h1
          className="text-4xl md:text-5xl leading-tight"
          style={{
            fontFamily: "var(--font-primary)",
            color: "var(--color-font)",
          }}
        >
          Protect your plants, get started
        </h1>

        <h2
          className="text-4xl md:text-5xl leading-tight"
          style={{
            fontFamily: "var(--font-primary)",
            color: "var(--color-font)",
          }}
        >
          today with Verdan
        </h2>

        <Link
          href="https://dev.dt8mvbuq4t843.amplifyapp.com/"
          className="mt-10 inline-block rounded-full border px-14 py-2 text-xl transition-all duration-300"
          style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--background)",
            borderColor: "var(--color-primary)",
            fontFamily: "var(--font-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--background)";
            e.currentTarget.style.color = "var(--color-font)";
            e.currentTarget.style.borderColor = "var(--foreground)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary)";
            e.currentTarget.style.color = "var(--foreground)";
            e.currentTarget.style.borderColor = "var(--color-primary)";
          }}
        >
          Get Started
        </Link>
      </div>
    </section>
  );
};

export default CTA;
