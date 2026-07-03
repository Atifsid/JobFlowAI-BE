import Card from "./Card";

export type StatTone = "success" | "warning" | "error" | "neutral";

interface StatCardProps {
  label: string;
  value: number | string;
  tone?: StatTone;
}

export default function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <Card className="stat-card">
      <p className={`text-display${tone ? ` text-display--${tone}` : ""}`}>{value}</p>
      <p className="text-small">{label}</p>
    </Card>
  );
}
