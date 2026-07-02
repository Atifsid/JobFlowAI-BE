import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import { useJobStatusUpdate } from "./useJobStatusUpdate";
import type { Dashboard, JobStatus } from "../types";

export function useTracker() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateStatus: patchStatus } = useJobStatusUpdate();

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    return dashboardService.getDashboard()
      .then(setDashboard)
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load tracker"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = useCallback(async (jobId: string, status: JobStatus) => {
    const updated = await patchStatus(jobId, status);
    if (updated) {
      setDashboard(prev => prev && { ...prev, jobs: prev.jobs.map(p => (p.job.id === jobId ? updated : p)) });
    }
  }, [patchStatus]);

  return { dashboard, loading, error, updateStatus, reload: load };
}
