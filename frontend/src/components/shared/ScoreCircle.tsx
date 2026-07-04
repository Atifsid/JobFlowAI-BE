interface ScoreCircleProps {
  score: number;
  size?: number;
}

export default function ScoreCircle({ score, size = 96 }: ScoreCircleProps) {
  const clamped = Math.min(Math.max(score, 0), 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <svg width={size} height={size} role="img" aria-label={`Score ${score} out of 100`}>
      <circle cx={center} cy={center} r={radius} stroke="var(--bg-hover)" strokeWidth={8} fill="none" />
      <circle
        cx={center}
        cy={center}
        r={radius}
        stroke="var(--brand)"
        strokeWidth={8}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="var(--text-primary)" fontSize="20" fontWeight="600">
        {score}
      </text>
    </svg>
  );
}
