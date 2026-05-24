import Image from "next/image";
import Link from "next/link";
import {
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaXTwitter,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { footerNavItems, sectionHref } from "@/lib/site-nav";
import { landingSectionPx, landingSectionTop } from "@/lib/site-layout";
import { typeUi, typeUiMedium } from "@/lib/typography";

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
        "relative w-full scroll-mt-[4.25rem] border-t border-white/15 bg-[var(--verdan-green)] text-white",
        "shadow-[0_-12px_40px_rgba(0,0,0,0.12)]",
        landingSectionTop,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20"
      />

      <div
        className={cn(
          "relative mx-auto max-w-7xl py-14 md:py-16 lg:py-20",
          landingSectionPx,
        )}
      >
        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <Link
              href="/"
              className="inline-flex shrink-0 items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Harit home"
            >
              <Image
                src="/icon.svg"
                alt=""
                width={44}
                height={44}
                unoptimized
                className="h-10 w-10 brightness-0 invert sm:h-11 sm:w-11"
              />
              <span className="text-3xl font-bold text-white sm:text-4xl">
                हरित
              </span>
            </Link>

            <p className={cn(typeUi, "text-white/80 lg:hidden")}>
              Greener Tomorrow | Better Tomorrow
            </p>

            <nav aria-label="On this page" className="w-full lg:ml-auto lg:w-auto">
              <ul className="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 sm:gap-x-8 lg:justify-end">
                {footerNavItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={sectionHref(item.sectionId)}
                      className={cn(typeUiMedium, "text-white/90 transition-colors hover:text-white")}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <p className={cn(typeUi, "hidden text-white/80 lg:block")}>
              Greener Tomorrow | Better Tomorrow
            </p>

            <nav aria-label="Legal">
              <ul className="flex flex-wrap items-center justify-end gap-x-4 sm:gap-x-5">
                {legalLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={cn(typeUi, "text-white/75 transition-colors hover:text-white")}
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

      <div className="w-full border-t border-white/15">
        <div
          className={cn(
            "mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 py-5 sm:flex-row sm:items-center",
            landingSectionPx,
          )}
        >
          <p className={cn("text-center sm:text-left", typeUi, "text-white/80")}>
            © {year} हरित. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <span className={cn(typeUi, "text-white/80")}>
              Powered by Serentica
            </span>
            <span className="text-white/50" aria-hidden>
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
                    className="text-white/85 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--verdan-green)]"
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
