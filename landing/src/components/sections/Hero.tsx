import FallingLeaves from "@/components/FallingLeaves";
import HeroDashboard from "@/components/HeroDashboard";

const Hero = () => {
  return (
    <section
      id="product"
      className="relative flex w-full flex-col justify-start bg-[var(--background)] px-3 pt-[4.25rem] pb-12 text-[var(--color-font)] transition-colors duration-500 sm:px-5 sm:pb-16 sm:pt-[16.25rem] lg:pb-20"
    >
      <FallingLeaves className="hero-falling-leaves" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start text-left">
        <h1 className="text-[1.75rem] font-semibold leading-[1.1] sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]">
          Plantation Monitoring and Management,
        </h1>
        <h2 className="mt-0.5 text-[1.75rem] font-semibold leading-[1.1] sm:mt-1 sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]">
          Easier Than Ever
        </h2>
        <div className="mt-4 flex w-full flex-col gap-3 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:mt-5">
          <p className="max-w-2xl text-[16px] font-light leading-snug text-gray-600 lg:text-[18px]">
            Track plantations with GPS, photos, growth insights, and team coordination
          </p>
          <p className="group flex shrink-0 cursor-default items-center gap-2 text-[16px] font-light leading-snug text-gray-600 transition-colors duration-150 hover:text-black lg:text-[18px]">
            <span className="hero-live-dot" aria-hidden>
              <span className="hero-live-dot__ripple" />
              <span className="hero-live-dot__ripple" />
              <span className="hero-live-dot__core" />
            </span>
            We built a mobile application
            <svg
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="h-[0.85em] w-[0.85em] shrink-0 [&_path:first-child]:opacity-0 [&_path:first-child]:transition-opacity [&_path:first-child]:duration-300 [&_path:first-child]:ease-[cubic-bezier(0.25,1,0.5,1)] [&_path:last-child]:transition-transform [&_path:last-child]:duration-300 [&_path:last-child]:ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:[&_path:first-child]:opacity-100 group-hover:[&_path:last-child]:translate-x-[3px]"
            >
              <path d="M0.5 5.5h7" />
              <path d="M1.5 1.5l4 4-4 4" />
            </svg>
          </p>
        </div>
      </div>

      <div className="hero-dashboard-scene relative z-10 mt-11 w-full sm:mt-14 lg:mt-16">
        <div className="hero-dashboard-elevated mx-auto w-full max-w-7xl px-3 sm:px-5">
          <div className="hero-dashboard-effects" aria-hidden>
            <div className="hero-dashboard-glow" />
          </div>
          <HeroDashboard />
        </div>
      </div>
    </section>
  );
};

export default Hero;
