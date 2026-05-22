import HeroDashboard from "@/components/HeroDashboard";
import { cn } from "@/lib/utils";

type HeroDashboardSceneProps = {
  className?: string;
};

/** Full hero dashboard presentation — glow, shadows, gradients, and panel. */
export function HeroDashboardScene({ className }: HeroDashboardSceneProps) {
  return (
    <div className={cn("hero-dashboard-scene relative z-10 w-full", className)}>
      <div className="hero-dashboard-page-gradient" aria-hidden />
      <div className="hero-dashboard-elevated relative z-[1] mx-auto w-full max-w-[85rem] overflow-visible px-3 sm:px-5 max-md:max-w-none max-md:px-0">
        <div className="hero-dashboard-effects" aria-hidden>
          <div className="hero-dashboard-glow" />
        </div>
        <div className="hero-dashboard-corner-shadows" aria-hidden>
          <div className="hero-dashboard-floor-shadow" />
          <div className="hero-dashboard-corner-shadow hero-dashboard-corner-shadow--left" />
          <div className="hero-dashboard-corner-shadow hero-dashboard-corner-shadow--right" />
        </div>
        <div className="hero-dashboard-mobile-clip max-md:-mr-6 max-md:w-[calc(100%+1.5rem)]">
          <div className="hero-dashboard-panel-wrap relative z-[1]">
            <div className="hero-dashboard-rim-light" aria-hidden />
            <div className="hero-dashboard-panel-scale">
              <HeroDashboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
