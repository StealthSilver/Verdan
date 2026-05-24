import { cn } from "@/lib/utils";
import { typeDisplayTracking } from "@/lib/typography";

type SectionShellProps = {
  id: string;
  title: string;
};

export default function SectionShell({ id, title }: SectionShellProps) {
  return (
    <section
      id={id}
      className={cn(
        "flex min-h-screen scroll-mt-[4.25rem] flex-col bg-[var(--background)]",
        "px-6 pt-28 text-[var(--color-font)] sm:px-8 md:px-10"
      )}
    >
      <h2
        className={cn(
          "text-[1.75rem] font-semibold leading-[1.1] sm:text-[2.125rem] md:text-[2.375rem]",
          typeDisplayTracking,
        )}
      >
        {title}
      </h2>
    </section>
  );
}
