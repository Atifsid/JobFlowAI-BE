import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { JobPipeline, ResumeResult } from "../types";

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [pipeline, setPipeline] = useState<JobPipeline | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [resume, setResume] = useState<ResumeResult | null>(null);

  useEffect(() => {
    api
      .getDashboard()
      .then(dashboard => {
        const match = dashboard.jobs.find(j => j.job.id === id);
        if (!match) throw new Error("Job not found in dashboard");
        setPipeline(match);
      })
      .catch(err => setError(err instanceof Error ? err.message : "Failed to load job"));
  }, [id]);

  const onGenerateResume = async () => {
    if (!id) return;
    setGenerating(true);
    setError(null);
    try {
      setResume(await api.generateResume(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (error) return <p role="alert">{error}</p>;
  if (!pipeline) return <p>Loading...</p>;

  const { job, score, decision, status } = pipeline;

  return (
    <div>
      <h1>{job.title} @ {job.company}</h1>
      <p>{job.location} {job.remote ? "(Remote)" : ""}</p>
      <p>Score: {score.score} - Decision: {decision} - Status: {status}</p>
      <p>
        <a href={job.applyUrl} target="_blank" rel="noreferrer">Apply link</a>
      </p>

      <nav style={{ display: "flex", gap: "1rem" }}>
        <Link to={`/jobs/${id}/employees`}>Find Employees</Link>
        <Link to={`/jobs/${id}/referral`}>Referral Drafts</Link>
      </nav>

      <section>
        <h2>Resume</h2>
        <button onClick={onGenerateResume} disabled={generating}>
          {generating ? "Generating..." : "Generate Resume"}
        </button>
        {resume && (
          <p>
            <a href={`/files/resumes/${resume.pdfPath.split("/").pop()}`} target="_blank" rel="noreferrer">
              View PDF
            </a>
            {resume.driveLink && (
              <>
                {" "}
                | <a href={resume.driveLink} target="_blank" rel="noreferrer">Drive link</a>
              </>
            )}
          </p>
        )}
      </section>
    </div>
  );
}
