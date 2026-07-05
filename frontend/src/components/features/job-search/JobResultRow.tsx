import { Link } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import type { JobPipeline } from "@/types";

interface JobResultRowProps {
  pipeline: JobPipeline;
  checked: boolean;
  onCheckedChange: () => void;
  checkDisabled?: boolean;
  pipelineStatusLabel?: string;
}

export default function JobResultRow({
  pipeline,
  checked,
  onCheckedChange,
  checkDisabled,
  pipelineStatusLabel
}: JobResultRowProps) {
  const { job } = pipeline;

  return (
    <div className="flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:ring-foreground/20">
      <Checkbox
        checked={checked}
        disabled={checkDisabled}
        onCheckedChange={onCheckedChange}
        aria-label={`Select ${job.title} for pipeline`}
      />
      {pipelineStatusLabel && (
        <span className="shrink-0 text-xs text-muted-foreground">{pipelineStatusLabel}</span>
      )}
      <Link
        to={`/jobs/${job.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
      >
        <InitialsAvatar name={job.company} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{job.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {job.company}
            <span className="hidden sm:inline">
              {" "}
              · {job.location}
              {job.remote ? " · Remote" : ""}
            </span>
          </p>
        </div>
      </Link>
    </div>
  );
}
