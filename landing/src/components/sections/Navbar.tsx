"use client";

import { useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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
      className="fixed top-0 left-0 right-0 z-[100] w-full px-3 sm:px-6 py-2 sm:py-3 bg-white backdrop-blur-lg shadow-sm text-[var(--color-font)]"
      style={{ position: "relative" }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="flex items-center cursor-pointer flex-shrink-0"
        >
          <motion.img
            src="/verdan_light.svg"
            alt="Verdan Logo"
            className="w-20 h-auto sm:w-24 md:w-28 lg:w-32 xl:w-36"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </Link>

        <div
          className="hidden md:flex items-center px-2 font-sans relative gap-4 lg:gap-6"
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
                className="font-sans text-sm lg:text-base relative z-10 transition-colors text-gray-700 hover:text-black"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <Link
            href="https://verdan-beige.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-black hover:bg-black hover:text-white rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-glow group flex items-center justify-center font-sans font-semibold text-sm lg:text-base whitespace-nowrap"
          >
            Get Started Free
            <ArrowRight className="ml-1.5 h-4 w-4 lg:h-5 lg:w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMenu}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            {isOpen ? (
              <X size={24} className="text-gray-800" />
            ) : (
              <Menu size={24} className="text-gray-800" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[72px] left-0 right-0 md:hidden bg-white/95 backdrop-blur-md shadow-lg border-t border-gray-200 font-sans overflow-hidden z-50"
          >
            <div className="flex flex-col items-center space-y-4 py-6 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="transition-colors text-gray-700 hover:text-black font-medium text-base"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <Link
                href="https://verdan-beige.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full rounded-full border border-black bg-black text-white hover:bg-white hover:text-black transition-colors px-4 py-2 text-center font-sans font-semibold text-sm mt-4"
                onClick={() => setIsOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
