"use client";

import { cn } from "@/lib/utils";
import { DottedMap } from "@/components/ui/DottedMap";

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
          Start Managing Your Plantations Smarter
        </h2>

        <div
          className={cn(
            "h-[min(48vh,380px)] w-full sm:h-[min(50vh,420px)] md:h-[min(52vh,460px)]"
          )}
        >
        <DottedMap
          width={200}
          height={100}
          mapSamples={6000}
          markers={[]}
          dotColor="rgba(14, 14, 14, 0.45)"
          hoverDotColor="rgb(74, 137, 92)"
          dotRadius={0.28}
          className="h-full w-full text-[rgba(14,14,14,0.45)]"
          preserveAspectRatio="xMidYMid meet"
        />
        </div>
      </div>
    </section>
  );
};

export default Cta;
