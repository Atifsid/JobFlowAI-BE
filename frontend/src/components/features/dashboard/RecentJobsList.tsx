import { Link } from "react-router-dom";
import { SearchXIcon } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import RecentJobRow from "./RecentJobRow";
import type { JobPipeline } from "@/types";

interface RecentJobsListProps {
  jobs: JobPipeline[];
  loading: boolean;
}

const RECENT_COUNT = 6;

export default function RecentJobsList({ jobs, loading }: RecentJobsListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: RECENT_COUNT }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const recent = [...jobs]
    .sort((a, b) => (b.job.postedAt ?? "").localeCompare(a.job.postedAt ?? ""))
    .slice(0, RECENT_COUNT);

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title="No jobs tracked yet"
        description="Run a search to start matching jobs against your resume."
        action={<Button render={<Link to="/search" />}>Search Jobs</Button>}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recent.map(pipeline => (
        <RecentJobRow key={pipeline.job.id} pipeline={pipeline} />
      ))}
    </div>
  );
}
