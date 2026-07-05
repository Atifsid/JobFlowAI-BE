import { useId, useState } from "react";
import StatusBadge from "@/components/shared/StatusBadge";
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
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={toneForStatus(status)}>{labelForStatus(status)}</StatusBadge>
        <label htmlFor={selectId} className="sr-only">
          Change status
        </label>
        <select
          id={selectId}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
