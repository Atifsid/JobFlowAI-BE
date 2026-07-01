import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { runSequentiallyWithDelay, runWithConcurrency } from "../lib/bulk";
import type { Dashboard, JobDecision } from "../types";

type BulkStatus = "idle" | "pending" | "success" | "error";

export default function JobsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<JobDecision | "ALL">("ALL");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [bulkStatus, setBulkStatus] = useState<Record<string, BulkStatus>>({});
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      setDashboard(await api.getDashboard());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <p role="alert">{error}</p>;
  if (!dashboard) return <p>Loading...</p>;

  const jobs = dashboard.jobs.filter(
    j => decisionFilter === "ALL" || j.decision === decisionFilter
  );

  const toggle = (id: string) =>
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const selectedIds = Object.keys(selected).filter(id => selected[id]);

  const runBulk = async (
    mode: "resumes" | "employees-referrals"
  ) => {
    setBulkRunning(true);
    setBulkSummary(null);
    setBulkStatus(Object.fromEntries(selectedIds.map(id => [id, "pending"])));

    let successCount = 0;
    const failures: string[] = [];

    const onResult = (id: string, result: { status: "success" | "error"; error?: unknown }) => {
      setBulkStatus(prev => ({ ...prev, [id]: result.status }));
      if (result.status === "success") {
        successCount++;
      } else {
        const jobName = dashboard.jobs.find(j => j.job.id === id)?.job.company ?? id;
        const message = result.error instanceof Error ? result.error.message : "unknown error";
        failures.push(`${jobName}: ${message}`);
      }
    };

    if (mode === "resumes") {
      await runWithConcurrency(selectedIds, 3, id => api.generateResume(id), onResult);
    } else {
      await runSequentiallyWithDelay(
        selectedIds,
        async id => {
          return api.generateReferrals(id);
        },
        onResult,
        [3000, 5000]
      );
    }

    setBulkRunning(false);
    setBulkSummary(
      `${successCount} succeeded, ${failures.length} failed` +
        (failures.length ? ` - ${failures.join("; ")}` : "")
    );
  };

  return (
    <div>
      <h1>Pipeline ({dashboard.total} tracked)</h1>
      <p>
        {dashboard.referral} referral, {dashboard.directApply} direct apply, {dashboard.skip} skip
      </p>

      <select value={decisionFilter} onChange={e => setDecisionFilter(e.target.value as JobDecision | "ALL")}>
        <option value="ALL">All decisions</option>
        <option value="REFERRAL">Referral</option>
        <option value="DIRECT_APPLY">Direct Apply</option>
        <option value="SKIP">Skip</option>
      </select>

      {selectedIds.length > 0 && (
        <div>
          <p>{selectedIds.length} job(s) selected</p>
          <button disabled={bulkRunning} onClick={() => runBulk("resumes")}>
            Generate Resumes for Selected
          </button>
          <button disabled={bulkRunning} onClick={() => runBulk("employees-referrals")}>
            Find Employees & Draft Referrals for Selected
          </button>
          {bulkSummary && <p>{bulkSummary}</p>}
        </div>
      )}

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Company</th>
            <th>Score</th>
            <th>Decision</th>
            <th>Status</th>
            <th>Bulk</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(({ job, score, decision, status }) => (
            <tr key={job.id}>
              <td>
                <input
                  type="checkbox"
                  checked={!!selected[job.id]}
                  onChange={() => toggle(job.id)}
                />
              </td>
              <td>
                <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              </td>
              <td>{job.company}</td>
              <td>{score.score}</td>
              <td>{decision}</td>
              <td>{status}</td>
              <td>{bulkStatus[job.id] ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
