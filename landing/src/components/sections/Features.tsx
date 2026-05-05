"use client";

import { cn } from "@/lib/utils";
import { useInView } from "@/hooks/useInView";
import { PhotoDocSVG } from "@/components/svg/PhotoDocSVG";
import { AnalyticsSVG } from "@/components/svg/AnalyticsSVG";
import { TeamSVG } from "@/components/svg/TeamSVG";
import { TreeHealthSVG } from "@/components/svg/TreeHealthSVG";
import { SecuritySVG } from "@/components/svg/SecuritySVG";
import { RealTimeSVG } from "@/components/svg/RealTimeSVG";

const featureSvgs = [
  PhotoDocSVG,
  AnalyticsSVG,
  TeamSVG,
  TreeHealthSVG,
  SecuritySVG,
  RealTimeSVG,
] as const;

const features = [
  {
    title: "Photo Documentation",
    description:
      "Capture and store visual evidence of each tree at different growth stages with timestamped photos",
    featured: true,
  },
  {
    title: "Advanced Analytics",
    description:
      "Visualize tree health metrics, growth trends, and environmental impact in comprehensive dashboards",
    featured: true,
  },
  {
    title: "Team Management",
    description:
      "Collaborate with team members, assign roles, and manage permissions across projects",
    featured: false,
  },
  {
    title: "Tree Health Tracking",
    description:
      "Monitor vital metrics like height, leaf count, pest status, and overall health indicators",
    featured: false,
  },
  {
    title: "Data Security",
    description:
      "Enterprise-grade security with encrypted data storage and privacy-first architecture",
    featured: false,
  },
  {
    title: "Real-Time Updates",
    description:
      "Get instant notifications and live updates on tree status changes and milestones",
    featured: false,
  },
] as const;

const Features = () => {
  const { ref: headerRef, isInView: headerVisible } =
    useInView<HTMLDivElement>();
  const { ref: gridRef, isInView: gridVisible } = useInView<HTMLDivElement>();

  return (
    <section
      id="features"
      className={cn(
        "section-noise relative w-full overflow-hidden bg-[var(--background)] py-20 text-[var(--color-font)] sm:py-24 md:py-28 lg:py-36",
        "font-[family-name:var(--font-dm-sans)]"
      )}
    >
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          ref={headerRef}
          className={cn(
            "reveal-fade mb-14 text-center sm:mb-16 md:mb-20",
            headerVisible && "is-visible"
          )}
        >
          <h2 className="mb-4 text-sm font-light tracking-widest text-[var(--color-font)]/50 sm:text-base md:text-lg">
            Features
          </h2>
          <h3 className="mb-6 text-3xl font-semibold text-[rgb(74,137,92)] sm:mb-8 sm:text-4xl md:text-5xl">
            Powerful Features
          </h3>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-[var(--color-font)]/80 sm:text-lg md:text-xl">
            Everything you need to manage, monitor, and grow your forest with
            complete transparency
          </p>
        </div>

        <div
          ref={gridRef}
          className={cn(
            "reveal-stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6",
            gridVisible && "is-visible"
          )}
        >
          {features.map((feature, index) => {
            const Svg = featureSvgs[index];
            return (
              <article
                key={feature.title}
                className={cn(
                  "feature-card group relative flex flex-col overflow-hidden rounded-[24px] border border-black/[0.08] bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.08)] sm:p-8",
                  "transition-all duration-[400ms] cubic-bezier(0.4, 0, 0.2, 1)",
                  "hover:-translate-y-0.5 hover:border-[rgb(74,137,92)]/35 hover:shadow-[0_12px_40px_rgba(74,137,92,0.14)]",
                  feature.featured && "min-h-[260px] sm:min-h-[280px]"
                )}
              >
                <div className="relative z-[1] mb-4 flex h-32 w-full items-center justify-center overflow-hidden opacity-80 transition-opacity duration-500 group-hover:opacity-100 sm:mb-5">
                  <Svg />
                </div>

                <h4 className="relative z-[1] mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
                  {feature.title}
                </h4>
                <p className="relative z-[1] text-sm leading-relaxed text-[var(--color-font)]/72 sm:text-base">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
