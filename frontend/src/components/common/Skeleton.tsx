interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
}

export default function Skeleton({ width = "100%", height = "1rem", circle = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton${circle ? " skeleton--circle" : ""}`}
      style={{ width, height }}
      role="status"
      aria-label="Loading"
    />
  );
}
