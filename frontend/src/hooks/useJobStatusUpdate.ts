import { useState } from "react";
import { jobService } from "../services/jobService";
import type { JobPipeline, JobStatus } from "../types";

export function useJobStatusUpdate() {
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (jobId: string, status: JobStatus): Promise<JobPipeline | null> => {
    setError(null);
    try {
      return await jobService.updateStatus(jobId, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
      return null;
    }
  };

  return { updateStatus, error };
}
