import { useEffect, useState } from "react";
import { jobService } from "../services/jobService";
import type { Dashboard, JobSearchParams } from "../types";

export function useJobSearch() {
  const [params, setParams] = useState<JobSearchParams | null>(null);
  const [result, setResult] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;
    const handle = setTimeout(() => {
      setLoading(true);
      setError(null);
      jobService.search(params)
        .then(setResult)
        .catch(err => setError(err instanceof Error ? err.message : "Search failed"))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handle);
  }, [params]);

  return { result, loading, error, search: setParams };
}
