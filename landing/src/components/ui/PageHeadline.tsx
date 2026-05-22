import { cn } from "@/lib/utils";

export const pageHeadlineLine1Class =
  "text-[1.75rem] font-medium leading-[1.1] sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]";

export const pageHeadlineLine2Class =
  "mt-0.5 text-[1.75rem] font-medium leading-[1.1] sm:mt-1 sm:text-[2.125rem] md:text-[2.375rem] lg:text-[3.25rem]";

type PageHeadlineProps = {
  line1: string;
  line2: string;
  className?: string;
  line2ClassName?: string;
  align?: "left" | "center";
};

export function PageHeadline({
  line1,
  line2,
  className,
  line2ClassName,
  align = "left",
}: PageHeadlineProps) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <h1 className={pageHeadlineLine1Class}>{line1}</h1>
      <h2 className={cn(pageHeadlineLine2Class, line2ClassName)}>{line2}</h2>
    </div>
  );
}
