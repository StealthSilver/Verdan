import Image from "next/image";
import Link from "next/link";
import { Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Features", href: "/#features" },
  { name: "About", href: "/#about" },
];

const legalLinks = [
  {
    name: "Privacy Policy",
    href: "https://verdan-main.vercel.app/privacy-policy",
    external: true,
  },
  { name: "Terms of Service", href: "#", external: false },
  { name: "Cookie Policy", href: "#", external: false },
];

const socialLinks = [
  {
    name: "Twitter",
    href: "https://x.com/silver_srs",
    icon: Twitter,
  },
  {
    name: "GitHub",
    href: "https://github.com/StealthSilver/Verdan",
    icon: Github,
  },
];

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className={cn(
        "relative w-full border-t border-black/[0.08] bg-[var(--background)] text-[var(--color-font)]",
        "font-[family-name:var(--font-dm-sans)]",
        "shadow-[0_-12px_40px_rgba(0,0,0,0.06)]"
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[rgb(74,137,92)]/25"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-12 text-center lg:flex-row lg:items-start lg:justify-between lg:gap-16 lg:text-left">
          <div className="max-w-md lg:mx-0">
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/35"
              aria-label="Harit home"
            >
              <Image
                src="/icon.svg"
                alt=""
                width={44}
                height={44}
                className="h-10 w-10 sm:h-11 sm:w-11"
              />
              <span className="text-3xl font-bold text-[rgb(74,137,92)] sm:text-4xl">
                हरित
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-font)]/70 sm:text-base">
              Record, photograph, and follow every tree—turning field data into
              lasting impact.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-12 sm:gap-16 lg:justify-end">
            <nav aria-label="On this page" className="min-w-[8rem] text-left">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
                Navigate
              </p>
              <ul className="space-y-3">
                {navLinks.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--color-font)]/60 transition-colors hover:text-[rgb(74,137,92)] hover:opacity-100 sm:text-base"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal" className="min-w-[10rem] text-left">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-font)]/45">
                Legal
              </p>
              <ul className="space-y-3">
                {legalLinks.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      {...(item.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="text-sm text-[var(--color-font)]/60 transition-colors hover:text-[rgb(74,137,92)] hover:opacity-100 sm:text-base"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex flex-shrink-0 items-center justify-center gap-3 lg:justify-end">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full border border-white/55 bg-white/25 text-[var(--color-font)]/70 shadow-[0_8px_24px_rgba(0,0,0,0.08)] outline-none transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)",
                    "hover:-translate-y-0.5 hover:border-[rgb(74,137,92)]/35 hover:text-[rgb(74,137,92)] hover:shadow-[0_10px_28px_rgba(74,137,92,0.2)]",
                    "focus-visible:ring-2 focus-visible:ring-[rgb(74,137,92)]/40"
                  )}
                  style={{ WebkitBackdropFilter: "blur(12px)" }}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-12 border-t border-[rgba(255,255,255,0.08)] pt-8 text-center sm:mt-14 sm:pt-9">
          <p className="text-xs text-[var(--color-font)]/50 sm:text-sm">
            © {year} हरित
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
