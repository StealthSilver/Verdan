"use client";

import { cn } from "@/lib/utils";
import { BeginNowButton } from "@/components/ui/BeginNowButton";
import { DottedMap, type Marker } from "@/components/ui/DottedMap";

/** 7 pulsing spots — each has a status drawer (verified or sites active) */
const PULSING_SPOTS: Marker[] = [
  {
    lat: 45,
    lng: -98,
    size: 0.46,
    pulse: true,
    statusKind: "verified",
    statusLabel: "200k new trees verified",
  },
  {
    lat: -18,
    lng: -58,
    size: 0.46,
    pulse: true,
    statusKind: "sites",
    statusLabel: "52 sites active",
  },
  {
    lat: 50,
    lng: 8,
    size: 0.46,
    pulse: true,
    statusKind: "verified",
    statusLabel: "175k new trees verified",
  },
  {
    lat: -6,
    lng: 22,
    size: 0.46,
    pulse: true,
    statusKind: "sites",
    statusLabel: "48 sites active",
  },
  {
    lat: 22,
    lng: 78,
    size: 0.46,
    pulse: true,
    statusKind: "verified",
    statusLabel: "412k new trees verified",
  },
  {
    lat: 36,
    lng: 103,
    size: 0.46,
    pulse: true,
    statusKind: "sites",
    statusLabel: "63 sites active",
  },
  {
    lat: -26,
    lng: 134,
    size: 0.46,
    pulse: true,
    statusKind: "verified",
    statusLabel: "128k new trees verified",
  },
];

const Cta = () => {
  return (
    <section
      id="cta"
      className={cn(
        "relative flex w-full flex-col overflow-hidden scroll-mt-[4.25rem] bg-[var(--background)]",
        "py-16 sm:py-20 md:py-28",
        "min-h-[min(65vh,480px)] sm:min-h-[min(70vh,540px)] md:min-h-[min(75vh,600px)]"
      )}
    >
      <div
        className={cn(
          "mx-auto mt-12 flex w-[90%] max-w-5xl flex-col items-center sm:mt-16 md:mt-20"
        )}
      >
        <h2
          className={cn(
            "text-center text-[1.75rem] font-semibold leading-[1.1]",
            "sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]",
            "mb-8 sm:mb-10 md:mb-12"
          )}
        >
         Scale Your Environmental Impact
        </h2>

        <div
          className={cn(
            "h-[min(48vh,380px)] w-full sm:h-[min(50vh,420px)] md:h-[min(52vh,460px)]"
          )}
        >
        <DottedMap
          width={200}
          height={100}
          mapSamples={4000}
          markers={PULSING_SPOTS}
          dotColor="rgba(14, 14, 14, 0.45)"
          hoverDotColor="var(--verdan-green)"
          markerColor="var(--verdan-green)"
          dotRadius={0.28}
          hoverRadius={12}
          pulse
          className="h-full w-full"
        />
        </div>

        <div className="-mt-2 flex w-full justify-center sm:-mt-2 md:-mt-3">
          <BeginNowButton />
        </div>
      </div>
    </section>
  );
};

export default Cta;
