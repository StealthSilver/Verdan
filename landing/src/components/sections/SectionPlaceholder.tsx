/** Lightweight placeholder while below-fold sections load their JS chunks. */
export default function SectionPlaceholder({
  className = "min-h-[50vh] w-full bg-[var(--background)]",
}: {
  className?: string;
}) {
  return <div aria-hidden className={className} />;
}
