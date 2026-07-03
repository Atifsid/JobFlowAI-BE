import { useParams, useNavigate } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import JobDetailPanel from "../components/features/JobDetailPanel";
import Skeleton from "../components/common/Skeleton";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pipeline, loading, error, updateStatus } = useJobDetail(id);

  return (
    <div className="page">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      {error && <p role="alert">{error}</p>}

      {!error && (loading || !pipeline) && (
        <div className="job-detail" aria-busy="true" aria-label="Loading job">
          <div className="job-detail__header">
            <div className="job-detail__heading">
              <Skeleton width="320px" height="28px" />
              <Skeleton width="180px" height="16px" />
              <Skeleton width="240px" height="12px" />
            </div>
            <Skeleton width="150px" height="32px" />
          </div>
          <div className="job-detail__score-row">
            <Skeleton width="120px" height="120px" circle />
            <div className="job-detail__reasoning">
              <Skeleton width="70%" height="16px" />
              <Skeleton width="90%" height="16px" />
            </div>
          </div>
          <Skeleton height="72px" />
          <div className="job-actions__list">
            <Skeleton width="140px" height="36px" />
            <Skeleton width="140px" height="36px" />
          </div>
        </div>
      )}

      {!error && !loading && pipeline && (
        <JobDetailPanel pipeline={pipeline} onStatusChange={updateStatus} />
      )}
    </div>
  );
}
