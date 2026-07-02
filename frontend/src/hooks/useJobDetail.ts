import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import type { JobPipeline, JobStatus } from "../types";

export function useJobDetail(jobId: string | undefined) {
  const [pipeline, setPipeline] = useState<JobPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateStatus: patchStatus } = useJobStatusUpdate();

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    dashboardService.getDashboard()
      .then(dashboard => {
        const match = dashboard.jobs.find(j => j.job.id === jobId);
        if (!match) throw new Error("Job not found in dashboard");
        setPipeline(match);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = async (status: JobStatus) => {
    if (!jobId) return;
    const updated = await patchStatus(jobId, status);
    if (updated) setPipeline(updated);
  };

  return { pipeline, loading, error, updateStatus };
}
