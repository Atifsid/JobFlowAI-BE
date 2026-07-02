import { useParams, Link } from "react-router-dom";
import { useResume } from "../hooks/useResume";
import Button from "../components/common/Button";

export default function ResumeTailor() {
  const { id } = useParams<{ id: string }>();
  const { resume, generating, error, generate } = useResume(id);

  return (
    <div className="page">
      <h1 className="text-display">Resume Tailor</h1>

      {error && <p role="alert">{error}</p>}

      {!resume && (
        <Button onClick={generate} disabled={generating}>
          {generating ? "Generating tailored resume..." : "Generate Tailored Resume"}
        </Button>
      )}

      {resume && (
        <div className="resume-preview">
          <p>
            <a href={`/files/resumes/${resume.pdfPath.split("/").pop()}`} target="_blank" rel="noreferrer">
              View PDF
            </a>
          </p>
          {resume.driveLink && (
            <p>
              <a href={resume.driveLink} target="_blank" rel="noreferrer">
                Share to Drive
              </a>
            </p>
          )}
        </div>
      )}

      {id && <Link to={`/jobs/${id}/employees`}>Find Contacts</Link>}
    </div>
  );
}
