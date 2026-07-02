import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import type { Dashboard } from "../types";

export function useDashboard() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.getDashboard()
      .then(setDashboard)
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  return { dashboard, loading, error };
}
