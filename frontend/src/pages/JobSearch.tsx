import { useState } from "react";
import type { FormEvent } from "react";
import { useJobSearch } from "../hooks/useJobSearch";
import { useJobStatusUpdate } from "../hooks/useJobStatusUpdate";
import JobCard from "../components/features/JobCard";
import JobDetailPanel from "../components/features/JobDetailPanel";
import Button from "../components/common/Button";
import type { JobStatus } from "../types";

export default function JobSearch() {
  const [title, setTitle] = useState("");
  const [remote, setRemote] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { result, loading, error, search } = useJobSearch();
  const { updateStatus } = useJobStatusUpdate();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    search({ title, remote });
  };

  const selected = result?.jobs.find(j => j.job.id === selectedId) ?? null;

  const onStatusChange = async (status: JobStatus) => {
    if (!selected) return;
    await updateStatus(selected.job.id, status);
    if (status === "SKIPPED") setSelectedId(null);
  };

  return (
    <div className="page">
      <h1 className="text-display">Job Search</h1>

      <form onSubmit={onSubmit} className="search-bar">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Job title" required />
        <label>
          <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} />
          Remote only
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {error && <p role="alert">{error}</p>}

      {result && (
        <p className="text-small">
          Results: {result.total} jobs | Referral: {result.referral} | Apply: {result.directApply} | Skip: {result.skip}
        </p>
      )}

      <div className={`job-search-layout${selectedId ? " job-search-layout--detail" : ""}`}>
        <div className="job-search-list">
          {result?.jobs.map(pipeline => (
            <JobCard
              key={pipeline.job.id}
              pipeline={pipeline}
              selected={pipeline.job.id === selectedId}
              onClick={() => setSelectedId(pipeline.job.id)}
            />
          ))}
        </div>

        {selected && (
          <div className="job-search-detail">
            <button className="back-button" onClick={() => setSelectedId(null)}>
              ← Back
            </button>
            <JobDetailPanel pipeline={selected} onStatusChange={onStatusChange} />
          </div>
        )}
      </div>
    </div>
  );
}
