import { Link } from "react-router-dom";
import Badge from "../common/Badge";
import Button from "../common/Button";
import ScoreCircle from "../common/ScoreCircle";
import SkillBadges from "./SkillBadges";
import type { JobPipeline } from "../../types";

interface JobDetailPanelProps {
  pipeline: JobPipeline;
  onSkip?: () => void;
}

export default function JobDetailPanel({ pipeline, onSkip }: JobDetailPanelProps) {
  const { job, score, status } = pipeline;

  return (
    <div className="job-detail-panel">
      <div>
        <h2 className="text-heading">{job.title}</h2>
        <p className="text-body">
          {job.company} · {job.location}
          {job.remote ? " (Remote)" : ""}
        </p>
        <Badge tone="neutral">{status}</Badge>
      </div>

      <ScoreCircle score={score.score} />
      <SkillBadges score={score} />

      <details>
        <summary className="text-small">Job Description</summary>
        <p className="text-body">{job.description}</p>
      </details>

      <div className="job-detail-panel__actions">
        <a href={job.applyUrl} target="_blank" rel="noreferrer">
          <Button variant="secondary">Open Listing</Button>
        </a>
        {onSkip && (
          <Button variant="secondary" onClick={onSkip}>
            Skip
          </Button>
        )}
        <Link to={`/jobs/${job.id}/resume`}>
          <Button>Tailor Resume</Button>
        </Link>
        <Link to={`/jobs/${job.id}/employees`}>
          <Button variant="secondary">Find Contacts</Button>
        </Link>
      </div>
    </div>
  );
}
