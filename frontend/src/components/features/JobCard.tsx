import Card from "../common/Card";
import Badge from "../common/Badge";
import type { JobPipeline } from "../../types";

interface JobCardProps {
  pipeline: JobPipeline;
  selected?: boolean;
  onClick?: () => void;
}

const toneForDecision = (decision: JobPipeline["decision"]) => {
  if (decision === "REFERRAL") return "success" as const;
  if (decision === "DIRECT_APPLY") return "warning" as const;
  return "neutral" as const;
};

export default function JobCard({ pipeline, selected, onClick }: JobCardProps) {
  const { job, score, decision } = pipeline;

  return (
    <Card
      className={`job-card${selected ? " job-card--selected" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <p className="text-heading">{job.title}</p>
      <p className="text-body">{job.company}</p>
      <Badge tone={toneForDecision(decision)}>{score.score}</Badge>
    </Card>
  );
}
