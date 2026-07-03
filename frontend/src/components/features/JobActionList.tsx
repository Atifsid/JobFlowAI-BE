import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../common/Button";
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
    <div className="job-actions">
      <div className="job-actions__list">
        {specs.length === 0 && (
          <p className="text-small job-actions__empty">No further action needed for this job.</p>
        )}

        {specs.map(({ action, spec }, index) => {
          const variant = index === primaryIndex ? "primary" : "secondary";

          if (spec.kind === "route") {
            return (
              <Link key={action} to={spec.to!}>
                <Button variant={variant}>{spec.label}</Button>
              </Link>
            );
          }

          if (spec.kind === "external") {
            return (
              <a key={action} href={spec.to} target="_blank" rel="noreferrer">
                <Button variant={variant}>{spec.label}</Button>
              </a>
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
            <Button key={action} variant="secondary" disabled title="Not built yet">
              {spec.label}
            </Button>
          );
        })}

        {showOpenListing && (
          <a href={job.applyUrl} target="_blank" rel="noreferrer">
            <Button variant="secondary">Open Listing</Button>
          </a>
        )}
      </div>
      {skipError && (
        <p role="alert" className="text-small job-actions__error">
          {skipError}
        </p>
      )}
    </div>
  );
}
