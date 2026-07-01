import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Dashboard, JobDecision } from "../types";

export default function JobsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<JobDecision | "ALL">("ALL");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

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

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Company</th>
            <th>Score</th>
            <th>Decision</th>
            <th>Status</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
