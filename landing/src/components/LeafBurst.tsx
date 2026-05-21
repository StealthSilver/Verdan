"use client";

const LEAF_PATH = "M8 2 C12 2 16 6 14 12 C12 16 6 16 4 12 C2 8 4 2 8 2 Z";

const LEAVES = [
  {
    fill: "#22C55E",
    left: "8%",
    size: 16,
    delay: 0,
    duration: 2.2,
    variant: "leaf-fall" as const,
  },
  {
    fill: "#16A34A",
    left: "32%",
    size: 14,
    delay: 90,
    duration: 2.5,
    variant: "leaf-fall-alt" as const,
  },
  {
    fill: "#4ADE80",
    left: "58%",
    size: 18,
    delay: 220,
    duration: 2.8,
    variant: "leaf-fall" as const,
  },
  {
    fill: "#15803D",
    left: "82%",
    size: 15,
    delay: 340,
    duration: 2.4,
    variant: "leaf-fall-alt" as const,
  },
] as const;

type LeafBurstProps = {
  className?: string;
};

export default function LeafBurst({ className = "" }: LeafBurstProps) {
  return (
    <div
      className={`hero-leaf-burst pointer-events-none absolute inset-0 overflow-hidden ${className}`.trim()}
      aria-hidden
    >
      {LEAVES.map((leaf, i) => (
        <svg
          key={i}
          viewBox="0 0 16 18"
          width={leaf.size}
          height={leaf.size}
          className={`hero-leaf-burst__leaf hero-leaf-burst__leaf--${leaf.variant}`}
          style={{
            left: leaf.left,
            animationDuration: `${leaf.duration}s`,
            animationDelay: `${leaf.delay}ms`,
          }}
        >
          <path d={LEAF_PATH} fill={leaf.fill} />
        </svg>
      ))}
    </div>
  );
}
