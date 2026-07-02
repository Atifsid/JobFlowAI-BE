import { useState } from "react";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types";

export function useEmployees(jobId: string | undefined) {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const find = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      setEmployees(await employeeService.find(jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Employee lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return { employees, loading, error, find };
}
