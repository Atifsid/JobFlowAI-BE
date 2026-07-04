import { Link } from "react-router-dom";
import { SearchIcon, SendIcon, XIcon, UserCheckIcon, GaugeIcon } from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import StatCard from "@/components/features/dashboard/StatCard";
import RecentJobsList from "@/components/features/dashboard/RecentJobsList";

export default function Dashboard() {
  const { dashboard, loading, error } = useDashboard();

  if (error) return <p role="alert">{error}</p>;

  const jobs = dashboard?.jobs ?? [];
  const averageScore =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, p) => sum + p.score.score, 0) / jobs.length)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        actions={
          <>
            <Button variant="outline" render={<Link to="/jobs" />}>
              View Tracker
            </Button>
            <Button render={<Link to="/search" />}>Search Jobs</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard label="Jobs Searched" value={dashboard?.total ?? 0} icon={SearchIcon} />
            <StatCard label="Referral Ready" value={dashboard?.referral ?? 0} icon={UserCheckIcon} tone="success" />
            <StatCard label="Direct Apply" value={dashboard?.directApply ?? 0} icon={SendIcon} tone="warning" />
            <StatCard label="Skipped" value={dashboard?.skip ?? 0} icon={XIcon} />
            {averageScore !== null && (
              <StatCard label="Avg. Match Score" value={averageScore} icon={GaugeIcon} />
            )}
          </>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
          {!loading && jobs.length > 0 && (
            <Link to="/jobs" className="text-sm text-muted-foreground hover:text-foreground">
              View all
            </Link>
          )}
        </div>
        <RecentJobsList jobs={jobs} loading={loading} />
      </section>
    </div>
  );
}
