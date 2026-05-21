import Image from "next/image";
import Link from "next/link";
import {
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "The Need", href: "/#the-need" },
  { name: "Product", href: "/#product" },
  { name: "Features", href: "/#features" },
  { name: "Proof", href: "/#proof" },
  { name: "Contact", href: "/#contact" },
];

const legalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

const serenticaSocialLinks = [
  {
    name: "Website",
    href: "https://www.serenticaglobal.com/",
    icon: FaGlobe,
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/serenticaglobal/",
    icon: FaInstagram,
  },
  {
    name: "X",
    href: "https://x.com/SerenticaGlobal",
    icon: FaXTwitter,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/serenticaglobal/",
    icon: FaLinkedin,
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className={cn(
        "relative w-full border-t border-[#fdfdfb]/10 bg-[#121c2b] text-[#fdfdfb]",
        "shadow-[0_-12px_40px_rgba(0,0,0,0.2)]"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[rgb(74,137,92)]/25"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/35"
              aria-label="Harit home"
            >
              <Image
                src="/icon.svg"
                alt=""
                width={44}
                height={44}
                className="h-10 w-10 sm:h-11 sm:w-11"
              />
              <span className="text-3xl font-bold text-[#fdfdfb] sm:text-4xl">
                हरित
              </span>
            </Link>

            <nav aria-label="On this page" className="w-full lg:ml-auto lg:w-auto">
              <ul className="flex flex-wrap items-center justify-end gap-x-6 gap-y-3 sm:gap-x-8">
                {navLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[#fdfdfb]/85 transition-colors hover:text-[#fdfdfb]"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className="text-[14px] text-[#fdfdfb]/40">
              Greener Tomorrow | Better Tomorrow
            </p>

            <nav aria-label="Legal">
              <ul className="flex flex-wrap items-center justify-end gap-x-4 sm:gap-x-5">
                {legalLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-[14px] text-[#fdfdfb]/40 transition-colors hover:text-[#fdfdfb]/65"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <div className="w-full border-t border-[#fdfdfb]/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 sm:py-5 lg:px-8">
          <p className="text-center text-[14px] text-[#fdfdfb]/40 sm:text-left">
            © {year} हरित. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span className="text-[14px] text-[#fdfdfb]/40">
              Powered by Serentica
            </span>
            <span className="text-[#fdfdfb]/30" aria-hidden>
              |
            </span>
            <div className="flex items-center gap-2">
              {serenticaSocialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.name}
                    className="text-[#fdfdfb]/60 transition-colors hover:text-[#fdfdfb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fdfdfb]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121c2b]"
                  >
                    <Icon className="h-3 w-3" aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
