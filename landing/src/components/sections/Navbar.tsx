"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["about", "features", "cta", "footer"] as const;

const navItems = [
  { name: "About", href: "#about", sectionId: "about" as const },
  { name: "Features", href: "#features", sectionId: "features" as const },
  { name: "Testimonials", href: "#cta", sectionId: "cta" as const },
  { name: "Contact us", href: "#footer", sectionId: "footer" as const },
];

const navTransition =
  "transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const updateScroll = useCallback(() => {
    setScrolled(window.scrollY > 48);
    const y = window.scrollY + 140;
    let current = "";
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      if (el.offsetTop <= y) current = id;
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, [updateScroll]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((v) => !v);

  const font = "font-[family-name:var(--font-dm-sans)]";

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] px-3 sm:px-5 pt-3 sm:pt-4",
        font,
        navTransition
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "mx-auto flex w-full max-w-7xl items-center justify-between gap-3",
          navTransition,
          scrolled &&
            "max-w-5xl rounded-full border border-white/55 bg-white/25 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-[180%] sm:px-5 sm:py-2.5",
          !scrolled && "bg-transparent py-1"
        )}
        style={
          scrolled
            ? {
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
              }
            : undefined
        }
      >
        <Link
          href="/"
          className="flex flex-shrink-0 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/40"
        >
          <Image
            src="/icon.svg"
            alt=""
            width={44}
            height={44}
            unoptimized
            className="h-8 w-auto sm:h-10 md:h-11"
          />
          <span className="text-2xl font-bold text-gray-800 sm:text-3xl md:text-4xl">
            हरित
          </span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const active = activeSection === item.sectionId;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-3 py-2 text-sm font-medium text-gray-700 outline-none lg:px-4 lg:text-base",
                    navTransition,
                    "hover:text-[rgb(74,137,92)] hover:shadow-[0_0_18px_rgba(74,137,92,0.18)]",
                    active &&
                      "text-[rgb(74,137,92)] shadow-[0_0_14px_rgba(74,137,92,0.2)]"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="https://verdan-beige.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group flex items-center justify-center whitespace-nowrap rounded-full border border-[rgb(74,137,92)]/35 bg-white/15 px-4 py-2 text-sm font-semibold text-gray-900 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/45 lg:text-base",
              navTransition,
              "hover:-translate-y-0.5 hover:border-[rgb(74,137,92)]/60 hover:shadow-[0_8px_28px_rgba(74,137,92,0.22)]"
            )}
            style={{ WebkitBackdropFilter: "blur(16px) saturate(180%)" }}
          >
            Get Started
            <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="flex rounded-full p-2.5 text-gray-800 outline-none backdrop-blur-sm transition hover:bg-white/40 focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/40 md:hidden"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <div
        id="mobile-nav-drawer"
        className={cn(
          "fixed inset-x-0 top-[4.25rem] z-[99] overflow-hidden md:hidden",
          navTransition,
          isOpen ? "pointer-events-auto max-h-[min(70vh,28rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <div
          className="mx-3 rounded-2xl border border-white/50 bg-white/45 px-4 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-[180%]"
          style={{ WebkitBackdropFilter: "blur(20px) saturate(180%)" }}
        >
          <div className="flex flex-col items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="w-full rounded-xl py-3 text-center text-base font-medium text-gray-800 outline-none transition hover:bg-white/50 hover:text-[rgb(74,137,92)] focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/35"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="https://verdan-beige.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="mt-4 flex w-full items-center justify-center rounded-full border border-[rgb(74,137,92)]/40 bg-white/25 py-3 text-center text-sm font-semibold text-gray-900 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md outline-none focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/45"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
