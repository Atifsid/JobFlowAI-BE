import Card from "./Card";

interface StatCardProps {
  label: string;
  value: number | string;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <Card className="stat-card">
      <p className="text-display">{value}</p>
      <p className="text-small">{label}</p>
    </Card>
  );
}
