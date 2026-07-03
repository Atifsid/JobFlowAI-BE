import Badge from "../common/Badge";
import ScoreCircle from "../common/ScoreCircle";
import SkillBadges from "./SkillBadges";
import JobStatusSelect from "./JobStatusSelect";
import JobActionList from "./JobActionList";
import { labelForDecision, toneForDecision, reasoningForDecision } from "../../lib/jobLabels";
import type { Job, JobPipeline, JobStatus } from "../../types";

interface JobDetailPanelProps {
  pipeline: JobPipeline;
  onStatusChange: (status: JobStatus) => Promise<void> | void;
}

function formatSalary(job: Job): string | null {
  const { salaryMin, salaryMax, currency = "" } = job;
  if (!salaryMin && !salaryMax) return null;
  const fmt = (n: number) => `${currency}${new Intl.NumberFormat("en-US").format(n)}`;
  if (salaryMin && salaryMax) return `${fmt(salaryMin)}–${fmt(salaryMax)}`;
  if (salaryMin) return `${fmt(salaryMin)}+`;
  return `Up to ${fmt(salaryMax as number)}`;
}

function formatPostedAt(postedAt?: string): string | null {
  if (!postedAt) return null;
  const date = new Date(postedAt);
  if (Number.isNaN(date.getTime())) return null;
  return `Posted ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date)}`;
}

function buildMeta(job: Job): string[] {
  const parts = [`${job.location}${job.remote ? " · Remote" : ""}`];
  if (job.employmentType) parts.push(job.employmentType);

  const salary = formatSalary(job);
  if (salary) parts.push(salary);

  parts.push(`via ${job.source}`);

  const posted = formatPostedAt(job.postedAt);
  if (posted) parts.push(posted);

  return parts;
}

export default function JobDetailPanel({ pipeline, onStatusChange }: JobDetailPanelProps) {
  const { job, score, decision, status } = pipeline;

  return (
    <div className="job-detail">
      <div className="job-detail__header">
        <div className="job-detail__heading">
          <h2 className="text-display">{job.title}</h2>
          <p className="text-body job-detail__company">
            {job.companyUrl ? (
              <a href={job.companyUrl} target="_blank" rel="noreferrer">
                {job.company}
              </a>
            ) : (
              job.company
            )}
          </p>
          <p className="text-small job-detail__meta">{buildMeta(job).join(" · ")}</p>
        </div>

        <JobStatusSelect status={status} onChange={onStatusChange} />
      </div>

      <div className="job-detail__score-row">
        <ScoreCircle score={score.score} size={120} />
        <div className="job-detail__reasoning">
          <div className="job-detail__decision-line">
            <Badge tone={toneForDecision(decision)}>{labelForDecision(decision)}</Badge>
            <p className="text-small">{reasoningForDecision(decision)}</p>
          </div>
          <p className="text-body">Recommendation: {score.recommendation}</p>
        </div>
      </div>

      <SkillBadges score={score} />

      <JobActionList job={job} actions={pipeline.actions} onSkip={() => onStatusChange("SKIPPED")} />

      <details className="job-detail__description">
        <summary className="text-small">Job Description</summary>
        <p className="text-body">{job.description}</p>
      </details>
    </div>
  );
}
