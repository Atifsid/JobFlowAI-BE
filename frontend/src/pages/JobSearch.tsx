import { useState } from "react";
import { SearchXIcon } from "lucide-react";
import { useJobSearch } from "../hooks/useJobSearch";
import { useJobStatusUpdate } from "../hooks/useJobStatusUpdate";
import { runSequentiallyWithDelay } from "../lib/bulk";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";
import JobDetailPanel from "../components/features/JobDetailPanel";
import JobFilters from "../components/features/job-search/JobFilters";
import JobResultRow from "../components/features/job-search/JobResultRow";
import PageHeader from "@/components/shared/PageHeader";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FormEvent } from "react";
import type { JobSearchParams, JobStatus } from "../types";

const PAGE_SIZE = 20;
const MAX_PIPELINE_JOBS = 5;

type PipelineStatus = "idle" | "pending" | "success" | "error";

export default function JobSearch() {
  const [filters, setFilters] = useState<JobSearchParams>({});
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pipelineSelected, setPipelineSelected] = useState<Record<string, boolean>>({});
  const [pipelineStatus, setPipelineStatus] = useState<Record<string, PipelineStatus>>({});
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineSummary, setPipelineSummary] = useState<string | null>(null);
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

  const pipelineIds = Object.keys(pipelineSelected).filter(id => pipelineSelected[id]);

  const togglePipelineSelection = (jobId: string) => {
    setPipelineSelected(prev => {
      const isSelected = !!prev[jobId];
      if (!isSelected && Object.values(prev).filter(Boolean).length >= MAX_PIPELINE_JOBS) return prev;
      return { ...prev, [jobId]: !isSelected };
    });
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    setPipelineSummary(null);
    setPipelineStatus(Object.fromEntries(pipelineIds.map(id => [id, "pending"])));

    let successCount = 0;
    const failures: string[] = [];

    await runSequentiallyWithDelay(
      pipelineIds,
      async jobId => {
        await resumeService.generate(jobId);
        return referralService.generateDrafts(jobId);
      },
      (jobId, res) => {
        setPipelineStatus(prev => ({ ...prev, [jobId]: res.status }));
        if (res.status === "success") {
          successCount++;
        } else {
          const jobName = result?.jobs.find(j => j.job.id === jobId)?.job.company ?? jobId;
          const message = res.error instanceof Error ? res.error.message : "unknown error";
          failures.push(`${jobName}: ${message}`);
        }
      }
    );

    setPipelineRunning(false);
    setPipelineSummary(
      `${successCount} succeeded, ${failures.length} failed` + (failures.length ? ` — ${failures.join("; ")}` : "")
    );
  };

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

      {pipelineIds.length > 0 && (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-foreground">{pipelineIds.length}/{MAX_PIPELINE_JOBS} job(s) selected</p>
            <Button size="sm" disabled={pipelineRunning} onClick={runPipeline}>
              {pipelineRunning ? "Running pipeline..." : "Run Pipeline"}
            </Button>
            {pipelineSummary && <p className="w-full text-xs text-muted-foreground">{pipelineSummary}</p>}
          </CardContent>
        </Card>
      )}

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
                  checked={!!pipelineSelected[pipeline.job.id]}
                  onCheckedChange={() => togglePipelineSelection(pipeline.job.id)}
                  checkDisabled={pipelineIds.length >= MAX_PIPELINE_JOBS && !pipelineSelected[pipeline.job.id]}
                  pipelineStatusLabel={
                    pipelineStatus[pipeline.job.id] && pipelineStatus[pipeline.job.id] !== "idle"
                      ? pipelineStatus[pipeline.job.id]
                      : undefined
                  }
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
