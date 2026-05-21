import Cta from "@/components/sections/Cta";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import NeedSection from "@/components/NeedSection";
import Navbar from "@/components/sections/Navbar";
import About from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      {/* <NeedSection />
      <About />
      <Features /> */}
      <Cta />
      <Footer />
    </>
  );
}
