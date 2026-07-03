import { useState } from "react";
import { useJobSearch } from "../hooks/useJobSearch";
import { useJobStatusUpdate } from "../hooks/useJobStatusUpdate";
import JobCard from "../components/features/JobCard";
import JobDetailPanel from "../components/features/JobDetailPanel";
import JobFilters from "../components/features/JobFilters";
import Pagination from "../components/common/Pagination";
import type { FormEvent } from "react";
import type { JobSearchParams, JobStatus } from "../types";

const PAGE_SIZE = 20;

export default function JobSearch() {
  const [filters, setFilters] = useState<JobSearchParams>({});
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { result, loading, error, search } = useJobSearch();
  const { updateStatus } = useJobStatusUpdate();

  const runSearch = (nextFilters: JobSearchParams, nextPage: number) => {
    search({ ...nextFilters, page: nextPage, limit: PAGE_SIZE });
  };

  const onFiltersSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    runSearch(filters, 1);
  };

  const onPageChange = (nextPage: number) => {
    setPage(nextPage);
    runSearch(filters, nextPage);
  };

  const selected = result?.jobs.find(j => j.job.id === selectedId) ?? null;

  const onStatusChange = async (status: JobStatus) => {
    if (!selected) return;
    await updateStatus(selected.job.id, status);
    if (status === "SKIPPED") setSelectedId(null);
  };

  const totalPages =
    result?.totalMatches !== undefined ? Math.max(1, Math.ceil(result.totalMatches / PAGE_SIZE)) : 1;

  return (
    <div className="page">
      <h1 className="text-display">Job Search</h1>

      {error && <p role="alert">{error}</p>}

      {result && (
        <p className="text-small">
          Results: {result.total} jobs | Referral: {result.referral} | Apply: {result.directApply} | Skip: {result.skip}
        </p>
      )}

      <div className={`job-search-layout${selectedId ? " job-search-layout--detail" : ""}`}>
        <JobFilters filters={filters} onChange={setFilters} onSubmit={onFiltersSubmit} loading={loading} />

        <div className="job-search-list">
          {result?.jobs.map(pipeline => (
            <JobCard
              key={pipeline.job.id}
              pipeline={pipeline}
              selected={pipeline.job.id === selectedId}
              onClick={() => setSelectedId(pipeline.job.id)}
            />
          ))}
          {result && <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />}
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
