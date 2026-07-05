import { useParams, Link } from "react-router-dom";
import { FileTextIcon } from "lucide-react";
import { useResume } from "../hooks/useResume";
import PageHeader from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ResumeTailor() {
  const { id } = useParams<{ id: string }>();
  const { resume, generating, error, generate } = useResume(id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Resume Tailor" description="Tailors your master resume's skills/experience/projects sections for this job." />

      {error && <p role="alert">{error}</p>}

      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <FileTextIcon className="size-10 text-muted-foreground" aria-hidden="true" />

          {!resume && (
            <>
              <p className="text-sm text-muted-foreground">
                Generate a version of your master resume tailored to this job's requirements.
              </p>
              <Button onClick={generate} disabled={generating}>
                {generating ? "Generating tailored resume..." : "Generate Tailored Resume"}
              </Button>
            </>
          )}

          {resume && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-foreground">Your tailored resume is ready.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button render={<a href={`/files/resumes/${resume.pdfPath.split("/").pop()}`} target="_blank" rel="noreferrer" />}>
                  View PDF
                </Button>
                {resume.driveLink && (
                  <Button variant="outline" render={<a href={resume.driveLink} target="_blank" rel="noreferrer" />}>
                    Share to Drive
                  </Button>
                )}
                {id && (
                  <Button variant="ghost" render={<Link to={`/jobs/${id}/employees`} />}>
                    Find Contacts
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
