import { useId, useState } from "react";
import Badge from "../common/Badge";
import { ALL_STATUSES, labelForStatus, toneForStatus } from "../../lib/jobLabels";
import type { JobStatus } from "../../types";

interface JobStatusSelectProps {
  status: JobStatus;
  onChange: (status: JobStatus) => Promise<void> | void;
}

export default function JobStatusSelect({ status, onChange }: JobStatusSelectProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectId = useId();

  const handleChange = async (next: JobStatus) => {
    if (next === status) return;
    setPending(true);
    setError(null);
    try {
      await onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="job-status">
      <div className="job-status__control">
        <Badge tone={toneForStatus(status)}>{labelForStatus(status)}</Badge>
        <label htmlFor={selectId} className="sr-only">
          Change status
        </label>
        <select
          id={selectId}
          className="job-status__select"
          value={status}
          disabled={pending}
          onChange={e => handleChange(e.target.value as JobStatus)}
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s}>
              {labelForStatus(s)}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p role="alert" className="text-small job-status__error">
          {error}
        </p>
      )}
    </div>
  );
}
