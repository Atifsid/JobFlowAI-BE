import { Link } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/common/StatCard";
import JobCard from "../components/features/JobCard";
import Skeleton from "../components/common/Skeleton";
import Button from "../components/common/Button";
import Card from "../components/common/Card";

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
      <div className="page-header">
        <h1 className="text-display">Dashboard</h1>
        <div className="page-header__actions">
          <Link to="/jobs">
            <Button variant="secondary">View Tracker</Button>
          </Link>
          <Link to="/search">
            <Button>Search Jobs</Button>
          </Link>
        </div>
      </div>

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
            <StatCard label="Referral Ready" value={dashboard?.referral ?? 0} tone="success" />
            <StatCard label="Direct Apply" value={dashboard?.directApply ?? 0} tone="warning" />
            <StatCard label="Skipped" value={dashboard?.skip ?? 0} tone="neutral" />
          </>
        )}
      </div>

      <section>
        <div className="section-header">
          <h2 className="text-heading">Recent Activity</h2>
          {!loading && recent.length > 0 && (
            <Link to="/jobs" className="section-header__link text-small">
              View all
            </Link>
          )}
        </div>

        {loading ? (
          <div className="job-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height="118px" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <Card className="empty-state">
            <p className="text-body">No jobs tracked yet.</p>
            <p className="text-small">Run a search to start matching jobs against your resume.</p>
            <Link to="/search">
              <Button>Search Jobs</Button>
            </Link>
          </Card>
        ) : (
          <div className="job-grid">
            {recent.map(pipeline => (
              <Link key={pipeline.job.id} to={`/jobs/${pipeline.job.id}`} className="job-card-link">
                <JobCard pipeline={pipeline} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
