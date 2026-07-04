import { Link } from "react-router-dom";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { labelForStatus, toneForStatus } from "@/lib/jobLabels";
import type { JobPipeline } from "@/types";

interface RecentJobRowProps {
  pipeline: JobPipeline;
}

export default function RecentJobRow({ pipeline }: RecentJobRowProps) {
  const { job, score, status } = pipeline;

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-shadow hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:ring-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
      <StatusBadge tone={toneForStatus(status)}>{labelForStatus(status)}</StatusBadge>
      <span
        aria-label={`Match score ${score.score} out of 100`}
        className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground"
      >
        {score.score}
      </span>
    </Link>
  );
}
