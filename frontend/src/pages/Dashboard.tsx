import { Link } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/common/StatCard";
import JobCard from "../components/features/JobCard";
import Skeleton from "../components/common/Skeleton";
import Button from "../components/common/Button";

export default function Dashboard() {
  const { dashboard, loading, error } = useDashboard();

  if (error) return <p role="alert">{error}</p>;

  const recent = dashboard
    ? [...dashboard.jobs]
        .sort((a, b) => (b.job.postedAt ?? "").localeCompare(a.job.postedAt ?? ""))
        .slice(0, 6)
    : [];

  return (
    <div className="page">
      <h1 className="text-display">Dashboard</h1>

      <div className="stats-grid">
        {loading ? (
          <>
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
            <Skeleton height="80px" />
          </>
        ) : (
          <>
            <StatCard label="Jobs Searched" value={dashboard?.total ?? 0} />
            <StatCard label="Referral Ready" value={dashboard?.referral ?? 0} />
            <StatCard label="Direct Apply" value={dashboard?.directApply ?? 0} />
            <StatCard label="Skipped" value={dashboard?.skip ?? 0} />
          </>
        )}
      </div>

      <section>
        <h2 className="text-heading">Recent Activity</h2>
        {recent.map(pipeline => (
          <Link key={pipeline.job.id} to={`/jobs/${pipeline.job.id}`}>
            <JobCard pipeline={pipeline} />
          </Link>
        ))}
      </section>

      <section>
        <h2 className="text-heading">Quick Start</h2>
        <Link to="/search">
          <Button>Search Jobs</Button>
        </Link>
        <Link to="/jobs">
          <Button variant="secondary">View Tracker</Button>
        </Link>
      </section>
    </div>
  );
}
