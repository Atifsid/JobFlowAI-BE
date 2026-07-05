import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { specForAction } from "../../lib/jobLabels";
import type { Job, JobAction } from "../../types";

interface JobActionListProps {
  job: Job;
  actions: JobAction[];
  onSkip: () => Promise<void> | void;
}

export default function JobActionList({ job, actions, onSkip }: JobActionListProps) {
  const [skipping, setSkipping] = useState(false);
  const [skipError, setSkipError] = useState<string | null>(null);

  const specs = actions.map(action => ({ action, spec: specForAction(action, job) }));
  const primaryIndex = specs.findIndex(({ spec }) => spec.kind !== "disabled");
  const showOpenListing = !actions.includes("APPLY");

  const handleSkip = async () => {
    setSkipping(true);
    setSkipError(null);
    try {
      await onSkip();
    } catch (err) {
      setSkipError(err instanceof Error ? err.message : "Failed to skip job");
    } finally {
      setSkipping(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {specs.length === 0 && (
          <p className="text-sm text-muted-foreground">No further action needed for this job.</p>
        )}

        {specs.map(({ action, spec }, index) => {
          const variant = index === primaryIndex ? "default" : "outline";

          if (spec.kind === "route") {
            return (
              <Button key={action} variant={variant} render={<Link to={spec.to!} />}>
                {spec.label}
              </Button>
            );
          }

          if (spec.kind === "external") {
            return (
              <Button
                key={action}
                variant={variant}
                render={<a href={spec.to} target="_blank" rel="noreferrer" />}
              >
                {spec.label}
              </Button>
            );
          }

          if (spec.kind === "status") {
            return (
              <Button key={action} variant={variant} onClick={handleSkip} disabled={skipping}>
                {skipping ? "Skipping…" : spec.label}
              </Button>
            );
          }

          return (
            <Button key={action} variant="outline" disabled title="Not built yet">
              {spec.label}
            </Button>
          );
        })}

        {showOpenListing && (
          <Button variant="outline" render={<a href={job.applyUrl} target="_blank" rel="noreferrer" />}>
            Open Listing
          </Button>
        )}
      </div>
      {skipError && (
        <p role="alert" className="text-xs text-destructive">
          {skipError}
        </p>
      )}
    </div>
  );
}
