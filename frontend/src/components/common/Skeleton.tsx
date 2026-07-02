interface SkeletonProps {
  width?: string;
  height?: string;
}

export default function Skeleton({ width = "100%", height = "1rem" }: SkeletonProps) {
  return <div className="skeleton" style={{ width, height }} role="status" aria-label="Loading" />;
}
