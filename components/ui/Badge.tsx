import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-surface-hover text-muted border-border",
  accent: "bg-accent-soft text-accent border-transparent",
  success: "bg-success/10 text-success border-transparent",
  warning: "bg-warning/10 text-warning border-transparent",
  danger: "bg-danger/10 text-danger border-transparent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium leading-5",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function SkillBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-border bg-surface px-2 py-0.5 font-mono text-[11px] text-muted">
      {children}
    </span>
  );
}
