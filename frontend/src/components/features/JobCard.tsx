import Card from "../common/Card";
import Badge from "../common/Badge";
import { toneForDecision, labelForDecision } from "../../lib/jobLabels";
import type { JobPipeline } from "../../types";

interface JobCardProps {
  pipeline: JobPipeline;
  selected?: boolean;
  onClick?: () => void;
}

export default function JobCard({ pipeline, selected, onClick }: JobCardProps) {
  const { job, score, decision } = pipeline;

  return (
    <Card
      className={`job-card${selected ? " job-card--selected" : ""}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <p className="text-heading job-card__title">{job.title}</p>
      <p className="text-body job-card__company">{job.company}</p>
      <p className="text-small job-card__meta">
        {job.location}
        {job.remote ? " · Remote" : ""}
      </p>
      <div className="job-card__footer">
        <span className="job-card__score">{score.score}</span>
        <Badge tone={toneForDecision(decision)}>{labelForDecision(decision)}</Badge>
      </div>
    </Card>
  );
}
