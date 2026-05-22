import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import { PageHeadline } from "@/components/ui/PageHeadline";
import { cn } from "@/lib/utils";
import { landingPageTopPad, landingSectionPx } from "@/lib/site-layout";
import { typeEyebrow, typeLede, typeNav } from "@/lib/typography";

type LegalPageShellProps = {
  line1: string;
  line2: string;
  lede?: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
};

export function LegalPageShell({
  line1,
  line2,
  lede,
  meta,
  children,
}: LegalPageShellProps) {
  return (
    <>
      <Navbar />
      <main
        className={cn(
          "min-h-screen bg-[var(--background)] text-[var(--color-font)]",
          landingPageTopPad,
        )}
      >
        <article
          className={cn(
            "mx-auto max-w-3xl pb-18 md:pb-22 lg:pb-32",
            landingSectionPx,
          )}
        >
          <Link
            href="/"
            className={cn(
              typeNav,
              "inline-flex items-center gap-2 text-[var(--color-font)]/55 transition-colors hover:text-[var(--verdan-green)]",
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>

          <p className={cn(typeEyebrow, "mt-4")}>Legal</p>

          <PageHeadline
            line1={line1}
            line2={line2}
            className="mt-3"
            line2ClassName="text-[var(--verdan-green)]"
          />

          {lede ? <p className={cn(typeLede, "mt-6")}>{lede}</p> : null}

          {meta ? <div className="legal-meta mt-6">{meta}</div> : null}

          <div className="legal-prose mt-12 md:mt-16">{children}</div>
        </article>
      </main>
      <Footer />
    </>
  );
}
