import { useState } from "react";
import { SearchXIcon } from "lucide-react";
import { useJobSearch } from "../hooks/useJobSearch";
import { useJobStatusUpdate } from "../hooks/useJobStatusUpdate";
import JobDetailPanel from "../components/features/JobDetailPanel";
import JobFilters from "../components/features/job-search/JobFilters";
import JobResultRow from "../components/features/job-search/JobResultRow";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Job Search"
        description={
          result
            ? `${result.total} jobs · Referral ${result.referral} · Apply ${result.directApply} · Skip ${result.skip}`
            : undefined
        }
      />

      {error && <p role="alert">{error}</p>}

      <div className={`grid gap-6 ${selectedId ? "lg:grid-cols-[280px_1fr_1fr]" : "lg:grid-cols-[280px_1fr]"}`}>
        <JobFilters filters={filters} onChange={setFilters} onSubmit={onFiltersSubmit} loading={loading} />

        <div className={`flex flex-col gap-2 ${selectedId ? "hidden lg:flex" : ""}`}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)
            : result?.jobs.length === 0
              ? (
                <EmptyState
                  icon={SearchXIcon}
                  title="No results"
                  description="Try widening your filters — fewer required fields usually surfaces more matches."
                />
              )
              : result?.jobs.map(pipeline => (
                <JobResultRow
                  key={pipeline.job.id}
                  pipeline={pipeline}
                  selected={pipeline.job.id === selectedId}
                  onSelect={() => setSelectedId(pipeline.job.id)}
                />
              ))}
          {result && result.jobs.length > 0 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        </div>

        {selected && (
          <div className="flex flex-col gap-3">
            <Button variant="ghost" size="sm" className="self-start" onClick={() => setSelectedId(null)}>
              ← Back
            </Button>
            <JobDetailPanel pipeline={selected} onStatusChange={onStatusChange} />
          </div>
        )}
      </div>
    </div>
  );
}
