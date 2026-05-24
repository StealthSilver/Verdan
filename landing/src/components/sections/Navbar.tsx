"use client";

import { useCallback, useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { BeginNowButton } from "@/components/ui/BeginNowButton";
import { sectionHref, siteNavItems } from "@/lib/site-nav";
import { typeNav, typeNavMobile } from "@/lib/typography";

const navTransition =
  "transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)";

const navLinkTransition =
  "transition-all duration-150 ease-out";

const navLinkGlassHover =
  "border border-transparent hover:border-white/55 hover:bg-white/25 hover:shadow-[0_2px_6px_rgba(0,0,0,0.11)] hover:backdrop-blur-xl hover:backdrop-saturate-[180%] hover:[-webkit-backdrop-filter:blur(20px)_saturate(180%)]";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const updateScroll = useCallback(() => {
    setScrolled(window.scrollY > 48);
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-5 pt-3 sm:pt-4",
        navTransition
      )}
    >
      <nav
        aria-label="Primary"
        className={cn(
          "flex w-full max-w-7xl items-center justify-between gap-3",
          navTransition,
          scrolled &&
            "rounded-[8px] bg-white/25 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-[180%] sm:px-5 sm:py-2.5",
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
          className="flex flex-shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/40"
        >
          <Image
            src="/icon.svg"
            alt=""
            width={30}
            height={30}
            priority
            unoptimized
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
          <span className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
            हरित
          </span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex translate-y-0.5 items-center gap-1 lg:gap-2">
            {siteNavItems.map((item) => (
              <Link
                key={item.name}
                href={sectionHref(item.sectionId)}
                className={cn(
                  "relative rounded-[8px] px-3 py-2 text-gray-600 outline-none lg:px-4",
                  typeNav,
                  navLinkTransition,
                  navLinkGlassHover,
                  "hover:text-black"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <BeginNowButton />
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
          "fixed inset-x-0 top-[4.25rem] z-[99] flex justify-center overflow-hidden px-3 sm:px-5 md:hidden",
          navTransition,
          isOpen ? "pointer-events-auto max-h-[min(70vh,28rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
      >
        <div
          className="w-full max-w-7xl rounded-2xl border border-white/80 bg-white/95 px-4 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl backdrop-saturate-[180%]"
          style={{ WebkitBackdropFilter: "blur(20px) saturate(180%)" }}
        >
          <div className="flex flex-col items-center gap-1">
            {siteNavItems.map((item) => (
              <Link
                key={item.name}
                href={sectionHref(item.sectionId)}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "w-full rounded-[8px] py-3 text-center text-gray-600 outline-none",
                  typeNavMobile,
                  navLinkTransition,
                  navLinkGlassHover,
                  "hover:text-black focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/35"
                )}
              >
                {item.name}
              </Link>
            ))}
            <BeginNowButton
              className="mt-4 w-full px-6 py-4"
              onClick={() => setIsOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
