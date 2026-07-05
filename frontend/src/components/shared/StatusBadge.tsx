import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BadgeTone = "success" | "warning" | "error" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]",
  warning: "bg-[color-mix(in_srgb,var(--warning)_15%,transparent)] text-[var(--warning)]",
  error: "bg-[color-mix(in_srgb,var(--error)_15%,transparent)] text-[var(--error)]",
  neutral: "bg-[color-mix(in_srgb,var(--neutral)_15%,transparent)] text-[var(--neutral)]",
};

interface StatusBadgeProps {
  tone: BadgeTone;
  children: React.ReactNode;
}

export default function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("border-transparent", TONE_CLASSES[tone])}>
      {children}
    </Badge>
  );
}
