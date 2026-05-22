import dynamic from "next/dynamic";

import Hero from "@/components/sections/Hero";
import Navbar from "@/components/sections/Navbar";
import SectionPlaceholder from "@/components/sections/SectionPlaceholder";

const NeedSection = dynamic(() => import("@/components/NeedSection"), {
  loading: () => <SectionPlaceholder className="min-h-[70vh] w-full bg-[var(--background)]" />,
});

const Product = dynamic(() => import("@/components/sections/Product"), {
  loading: () => <SectionPlaceholder className="min-h-screen w-full bg-[var(--background)]" />,
});

const Features = dynamic(() => import("@/components/sections/Features"), {
  loading: () => <SectionPlaceholder className="min-h-screen w-full bg-[var(--background)]" />,
});

const Proof = dynamic(() => import("@/components/sections/Proof"), {
  loading: () => <SectionPlaceholder className="min-h-screen w-full bg-[var(--background)]" />,
});

const Cta = dynamic(() => import("@/components/sections/Cta"), {
  loading: () => <SectionPlaceholder className="min-h-[65vh] w-full bg-[var(--background)]" />,
});

const Footer = dynamic(() => import("@/components/sections/Footer"));

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <NeedSection />
      {/* <Product /> */}
      <Features />
      <Proof />
      <Cta />
      <Footer />
    </>
  );
}
