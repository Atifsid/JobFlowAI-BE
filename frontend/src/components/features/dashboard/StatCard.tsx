import type { ComponentType, SVGProps } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatTone = "success" | "warning" | "neutral";

const TONE_TEXT: Record<StatTone, string> = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  neutral: "text-foreground",
};

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tone?: StatTone;
}

export default function StatCard({ label, value, icon: Icon, tone = "neutral" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3">
        <Icon aria-hidden="true" className="size-8 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <p className={cn("text-2xl font-semibold tracking-tight", TONE_TEXT[tone])}>{value}</p>
          <p className="truncate text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
