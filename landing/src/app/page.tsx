import Cta from "@/components/sections/Cta";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "@/components/sections/Navbar";
import Services from "@/components/sections/Services";
import Testimonial from "@/components/sections/Testimonials";
import GlobalHeroBg from "@/components/sections/GlobalHeroBg";

export default function Home() {
  return (
    <>
      {/* Background image behind navbar + hero */}
      {/* <GlobalHeroBg /> */}
      <Navbar />
      <Hero />

      <Features />
      <Testimonial />
      <Cta />
      <Footer />
    </>
  );
}
