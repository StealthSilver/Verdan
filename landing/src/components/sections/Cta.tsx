"use client";

import { cn } from "@/lib/utils";
import { BeginNowButton } from "@/components/ui/BeginNowButton";
import { DottedMap, type Marker } from "@/components/ui/DottedMap";

/** 16 plantation spots spread across continents */
const PULSING_SPOTS: Marker[] = [
  { lat: 28.6139, lng: 77.209, size: 0.48, pulse: true },
  { lat: -23.5505, lng: -46.6333, size: 0.45, pulse: true },
  { lat: -1.2921, lng: 36.8219, size: 0.44, pulse: true },
  { lat: -6.2088, lng: 106.8456, size: 0.46, pulse: true },
  { lat: 51.5074, lng: -0.1278, size: 0.43, pulse: true },
  { lat: -33.8688, lng: 151.2093, size: 0.47, pulse: true },
  { lat: 37.7749, lng: -122.4194, size: 0.45, pulse: true },
  { lat: 35.6762, lng: 139.6503, size: 0.44, pulse: true },
  { lat: 52.52, lng: 13.405, size: 0.42, pulse: true },
  { lat: 19.4326, lng: -99.1332, size: 0.46, pulse: true },
  { lat: 30.0444, lng: 31.2357, size: 0.43, pulse: true },
  { lat: 49.2827, lng: -123.1207, size: 0.45, pulse: true },
  { lat: -33.9249, lng: 18.4241, size: 0.44, pulse: true },
  { lat: 13.7563, lng: 100.5018, size: 0.47, pulse: true },
  { lat: -34.6037, lng: -58.3816, size: 0.45, pulse: true },
  { lat: 59.3293, lng: 18.0686, size: 0.42, pulse: true },
];

const Cta = () => {
  return (
    <section
      id="proof"
      className={cn(
        "relative flex w-full flex-col overflow-hidden bg-[var(--background)]",
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
