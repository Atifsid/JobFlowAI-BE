import type { ReactNode } from "react";

export type BadgeTone = "success" | "warning" | "error" | "neutral";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export default function Badge({ tone = "neutral", children }: BadgeProps) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
