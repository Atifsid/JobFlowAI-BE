import { Link } from "react-router-dom";
import { SearchIcon, SendIcon, FileTextIcon, UserCheckIcon } from "lucide-react";
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard label="Jobs Found" value={dashboard?.total ?? 0} icon={SearchIcon} />
            <StatCard label="Resumes Generated" value={dashboard?.resumesGenerated ?? 0} icon={FileTextIcon} tone="warning" />
            <StatCard label="Referrals Ready" value={dashboard?.referralsReady ?? 0} icon={UserCheckIcon} tone="success" />
            <StatCard label="Applied" value={dashboard?.applied ?? 0} icon={SendIcon} tone="success" />
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
