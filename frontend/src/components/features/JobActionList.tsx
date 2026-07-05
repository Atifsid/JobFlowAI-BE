import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Job } from "../../types";

interface JobActionListProps {
  job: Job;
  onSkip: () => Promise<void> | void;
}

export default function JobActionList({ job, onSkip }: JobActionListProps) {
  const [skipping, setSkipping] = useState(false);
  const [skipError, setSkipError] = useState<string | null>(null);

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
        <Button render={<Link to={`/jobs/${job.id}/resume`} />}>Tailor Resume</Button>
        <Button variant="outline" render={<Link to={`/jobs/${job.id}/employees`} />}>
          Find Contacts
        </Button>
        <Button variant="outline" render={<Link to={`/jobs/${job.id}/referral`} />}>
          Draft Referral
        </Button>
        <Button variant="outline" render={<a href={job.applyUrl} target="_blank" rel="noreferrer" />}>
          Open Listing
        </Button>
        <Button variant="outline" onClick={handleSkip} disabled={skipping}>
          {skipping ? "Skipping…" : "Skip"}
        </Button>
      </div>
      {skipError && (
        <p role="alert" className="text-xs text-destructive">
          {skipError}
        </p>
      )}
    </div>
  );
}
