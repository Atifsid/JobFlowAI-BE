import { useParams, useNavigate } from "react-router-dom";
import { useJobDetail } from "../hooks/useJobDetail";
import JobDetailPanel from "../components/features/JobDetailPanel";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pipeline, loading, error, updateStatus } = useJobDetail(id);

  if (error) return <p role="alert">{error}</p>;
  if (loading || !pipeline) return <p>Loading...</p>;

  return (
    <div className="page">
      <button className="back-button" onClick={() => navigate(-1)}>
        Back
      </button>
      <JobDetailPanel pipeline={pipeline} onSkip={() => updateStatus("SKIPPED")} />
    </div>
  );
}
