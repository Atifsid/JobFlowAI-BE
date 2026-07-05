import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import type { JobPipeline, JobStatus } from "../types";

export function useJobDetail(jobId: string | undefined) {
  const [pipeline, setPipeline] = useState<JobPipeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateStatus: patchStatus } = useJobStatusUpdate();

  const reload = useCallback(async () => {
    if (!jobId) return;
    setError(null);
    try {
      const dashboard = await dashboardService.getDashboard();
      const match = dashboard.jobs.find(j => j.job.id === jobId);
      if (!match) throw new Error("Job not found in dashboard");
      setPipeline(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load job");
    }
  }, [jobId]);

  useEffect(() => {
    setLoading(true);
    reload().finally(() => setLoading(false));
  }, [reload]);

  const updateStatus = async (status: JobStatus) => {
    if (!jobId) return;
    const updated = await patchStatus(jobId, status);
    if (updated) {
      setPipeline(updated);
    } else {
      throw new Error("Failed to update status");
    }
  };

  return { pipeline, loading, error, updateStatus, reload };
}
