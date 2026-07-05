import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import StatusBadge from "@/components/shared/StatusBadge";
import ScoreCircle from "../shared/ScoreCircle";
import SkillBadges from "./SkillBadges";
import JobStatusSelect from "./JobStatusSelect";
import JobActionList from "./JobActionList";
import type { Job, JobPipeline, JobStatus } from "../../types";

type PipelineStatus = "idle" | "pending" | "success" | "error";

interface JobDetailPanelProps {
  pipeline: JobPipeline;
  onStatusChange: (status: JobStatus) => Promise<void> | void;
  onRunPipeline?: () => Promise<void> | void;
  pipelineStatus?: PipelineStatus;
  pipelineMessage?: string | null;
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
  if (job.seniority) parts.push(job.seniority);
  if (job.employmentType) parts.push(job.employmentType);

  const salary = formatSalary(job);
  if (salary) parts.push(salary);

  parts.push(`via ${job.source}`);

  const posted = formatPostedAt(job.postedAt);
  if (posted) parts.push(posted);

  return parts;
}

export default function JobDetailPanel({
  pipeline,
  onStatusChange,
  onRunPipeline,
  pipelineStatus = "idle",
  pipelineMessage
}: JobDetailPanelProps) {
  const { job, status, ats } = pipeline;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">{job.title}</h2>
            <p className="text-sm text-muted-foreground">
              {job.companyUrl ? (
                <a href={job.companyUrl} target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">
                  {job.company}
                </a>
              ) : (
                job.company
              )}
            </p>
            <p className="text-xs text-muted-foreground">{buildMeta(job).join(" · ")}</p>
          </div>

          <JobStatusSelect status={status} onChange={onStatusChange} />
        </div>

        <Separator />

        {ats && (
          <>
            <div className="flex flex-wrap items-center gap-6">
              <ScoreCircle score={ats.score} size={120} />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <StatusBadge tone={ats.passed ? "success" : "warning"}>
                    {ats.passed ? "ATS Pass" : "Needs Review"}
                  </StatusBadge>
                  <p className="text-xs text-muted-foreground">
                    {ats.score}% of target keywords in the generated resume · {ats.pages}{" "}
                    page{ats.pages === 1 ? "" : "s"}
                  </p>
                </div>
                {ats.missingEmployers.length > 0 && (
                  <p className="text-xs text-destructive">
                    Dropped employer(s): {ats.missingEmployers.join(", ")} — review before sending.
                  </p>
                )}
              </div>
            </div>
            <SkillBadges matched={ats.matchedKeywords} missing={ats.missingKeywords} />
            {(ats.trueGaps?.length ?? 0) > 0 && (
              <p className="text-xs text-muted-foreground">
                Not in your master resume (true fit gaps, excluded from the score):{" "}
                {ats.trueGaps?.join(", ")}
              </p>
            )}
          </>
        )}

        {onRunPipeline && (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={onRunPipeline} disabled={pipelineStatus === "pending"}>
              {pipelineStatus === "pending" ? "Running pipeline…" : "Run Pipeline"}
            </Button>
            {pipelineMessage && (
              <p className={pipelineStatus === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
                {pipelineMessage}
              </p>
            )}
          </div>
        )}

        <JobActionList job={job} onSkip={() => onStatusChange("SKIPPED")} />

        <details className="border-t border-border pt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Job Description
          </summary>
          <p className="mt-3 max-w-[75ch] text-sm text-foreground">{job.description}</p>
        </details>
      </CardContent>
    </Card>
  );
}
