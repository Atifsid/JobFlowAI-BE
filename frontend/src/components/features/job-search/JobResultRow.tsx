import InitialsAvatar from "@/components/shared/InitialsAvatar";
import StatusBadge from "@/components/shared/StatusBadge";
import { labelForDecision, toneForDecision } from "@/lib/jobLabels";
import { cn } from "@/lib/utils";
import type { JobPipeline } from "@/types";

interface JobResultRowProps {
  pipeline: JobPipeline;
  selected: boolean;
  onSelect: () => void;
}

export default function JobResultRow({ pipeline, selected, onSelect }: JobResultRowProps) {
  const { job, score, decision } = pipeline;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl bg-card px-4 py-3 text-left ring-1 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "ring-2 ring-ring"
          : "ring-foreground/10 hover:shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:ring-foreground/20"
      )}
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
      <StatusBadge tone={toneForDecision(decision)}>{labelForDecision(decision)}</StatusBadge>
      <span
        aria-label={`Match score ${score.score} out of 100`}
        className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground"
      >
        {score.score}
      </span>
    </button>
  );
}
