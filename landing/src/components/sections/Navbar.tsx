"use client";

import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen((v) => !v);

  const navItems = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Features", href: "#features" },
    { name: "Contact us", href: "#footer" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] w-full px-4 sm:px-6 py-3 bg-white backdrop-blur-lg shadow-sm text-[var(--color-font)]"
      style={{ position: "relative" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center cursor-pointer">
          <motion.img
            src="/verdan_light.svg"
            alt="Verdan Logo"
            className="w-28 h-auto sm:w-32 md:w-36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        <div
          className="hidden md:flex items-center px-2 font-[var(--font-secondary)] relative gap-6"
          onMouseLeave={() => setHovered(null)}
        >
          {navItems.map((item) => (
            <div key={item.name} className="relative px-3 py-1.5 select-none">
              {hovered === item.name && (
                <motion.span
                  layoutId="hoverBg"
                  className="absolute inset-0 rounded-full backdrop-blur-sm bg-gray-200/70 border border-gray-300"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                    mass: 0.6,
                  }}
                  initial={false}
                />
              )}

              <Link
                href={item.href}
                onMouseEnter={() => setHovered(item.name)}
                onFocus={() => setHovered(item.name)}
                className="font-[var(--font-secondary)] relative z-10 transition-colors text-gray-700 hover:text-black"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6 font-mono">
          <Link
            href="https://verdan-beige.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-black  hover:bg-black hover:text-white rounded-full px-4 py-2 shadow-glow group flex items-center justify-center"
          >
            Get Started Free
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="p-1.5 rounded-md"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-[var(--background)]/95 backdrop-blur-md shadow-lg border-t border-[var(--foreground)]/20 font-[var(--font-secondary)]">
          <div className="flex flex-col items-center space-y-5 py-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="transition-colors text-[var(--color-font)] hover:text-[var(--foreground)]"
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <a
              href="#cta"
              className="rounded-full border px-6 py-1.5 transition-colors bg-[var(--color-primary)] text-[var(--background)] border-[var(--color-primary)] hover:bg-[var(--background)] hover:text-[var(--color-font)] hover:border-[var(--foreground)] font-[var(--font-secondary)]"
              onClick={() => setIsOpen(false)}
            >
              Connect
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
