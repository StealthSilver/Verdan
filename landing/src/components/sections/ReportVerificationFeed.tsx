"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { AnimatedList } from "@/components/ui/animated-list";
import { cn } from "@/lib/utils";

const VERDAN = "#48845c";

const VERIFICATION_STEPS = [
  { id: "export", label: "Export complete", Icon: CheckCircle2 },
  { id: "verified", label: "Verified submission", Icon: ShieldCheck },
  { id: "gps", label: "GPS synced", Icon: MapPin },
  { id: "audit", label: "Site audit passed", Icon: FileText },
] as const;

function VerificationStepCard({
  label,
  Icon,
}: {
  label: string;
  Icon: typeof CheckCircle2;
}) {
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setVerified(true), 650);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "flex w-full max-w-[240px] items-center gap-2.5 rounded-full border px-3.5 py-2.5 text-[12px] font-medium shadow-[0_8px_22px_-14px_rgba(14,14,14,0.2)] transition-colors duration-300",
        verified
          ? "border-[rgba(72,132,92,0.28)] bg-white"
          : "border-[rgba(14,14,14,0.08)] bg-white/95",
      )}
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
        style={{
          color: verified ? VERDAN : "rgba(14,14,14,0.45)",
          background: verified
            ? "rgba(72, 132, 92, 0.1)"
            : "rgba(14,14,14,0.05)",
        }}
      >
        <Icon size={14} strokeWidth={2} aria-hidden />
      </span>
      <span className="min-w-0 flex-1 truncate text-[var(--color-font)]/85">
        {label}
      </span>
      {verified ? (
        <span
          className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wide"
          style={{ color: VERDAN }}
        >
          <ShieldCheck size={12} aria-hidden />
          Verified
        </span>
      ) : (
        <Loader2
          size={14}
          className="shrink-0 animate-spin text-[var(--color-font)]/35"
          aria-label="Verifying"
        />
      )}
    </div>
  );
}

export function ReportVerificationFeed({ active }: { active: boolean }) {
  return (
    <AnimatedList
      active={active}
      delay={1400}
      className="w-full max-w-[260px] items-stretch gap-3"
    >
      {VERIFICATION_STEPS.map((step) => (
        <VerificationStepCard
          key={step.id}
          label={step.label}
          Icon={step.Icon}
        />
      ))}
    </AnimatedList>
  );
}
