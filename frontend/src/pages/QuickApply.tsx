import { useState } from "react";
import type { FormEvent } from "react";
import { UsersIcon } from "lucide-react";
import { resumeService } from "../services/resumeService";
import { referralService } from "../services/referralService";
import { employeeService } from "../services/employeeService";
import PageHeader from "@/components/shared/PageHeader";
import ScoreCircle from "@/components/shared/ScoreCircle";
import SkillBadges from "../components/features/SkillBadges";
import InitialsAvatar from "@/components/shared/InitialsAvatar";
import ContactCard from "../components/features/ContactCard";
import EmptyState from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ResumeResult, ReferralDraft, Employee } from "../types";

type PipelineStatus = "idle" | "pending" | "success" | "error";

const MIN_DESCRIPTION_LENGTH = 50;

export default function QuickApply() {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>("idle");
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [resume, setResume] = useState<ResumeResult | null>(null);
  const [drafts, setDrafts] = useState<ReferralDraft[] | null>(null);
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  const [contactsStatus, setContactsStatus] = useState<PipelineStatus>("idle");
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Employee[] | null>(null);

  const runPipeline = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !company.trim()) {
      setFormError("Job title and company are required.");
      return;
    }
    if (description.trim().length < MIN_DESCRIPTION_LENGTH) {
      setFormError(`Job description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`);
      return;
    }
    setFormError(null);
    setPipelineStatus("pending");
    setPipelineError(null);

    try {
      const resumeResult = await resumeService.generateAdhoc({ title, company, description });
      setResume(resumeResult);

      const referralDrafts = await referralService.generateDraftsAdhoc({
        title,
        company,
        driveLink: resumeResult.driveLink
      });
      setDrafts(referralDrafts);

      setPipelineStatus("success");
    } catch (err) {
      setPipelineStatus("error");
      setPipelineError(err instanceof Error ? err.message : "Pipeline failed");
    }
  };

  const copy = async (linkedin: string, message: string) => {
    await navigator.clipboard.writeText(message);
    setCopiedFor(linkedin);
    setTimeout(() => setCopiedFor(null), 2000);
  };

  const findContacts = async () => {
    if (!company.trim()) {
      setContactsError("Enter a company first.");
      return;
    }
    setContactsStatus("pending");
    setContactsError(null);
    try {
      setContacts(await employeeService.findAdhoc(company));
      setContactsStatus("success");
    } catch (err) {
      setContactsStatus("error");
      setContactsError(err instanceof Error ? err.message : "Employee lookup failed");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Paste JD"
        description="Run the resume and referral pipeline on a job description that isn't in any search results. Nothing about this job is saved except the generated resume."
      />

      <Card>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={runPipeline}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick-apply-title">Job Title</Label>
              <Input id="quick-apply-title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick-apply-company">Company</Label>
              <Input id="quick-apply-company" value={company} onChange={e => setCompany(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quick-apply-description">Job Description</Label>
              <Textarea
                id="quick-apply-description"
                className="min-h-40"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={pipelineStatus === "pending"}>
                {pipelineStatus === "pending" ? "Running pipeline…" : "Run Pipeline"}
              </Button>
              <Button type="button" variant="outline" onClick={findContacts} disabled={contactsStatus === "pending"}>
                {contactsStatus === "pending" ? "Searching LinkedIn…" : "Find Contacts"}
              </Button>
              {pipelineError && (
                <p role="alert" className="text-xs text-destructive">
                  {pipelineError}
                </p>
              )}
              {contactsError && (
                <p role="alert" className="text-xs text-destructive">
                  {contactsError}
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {resume?.ats && (
        <Card>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <ScoreCircle score={resume.ats.score} size={120} />
              <p className="text-xs text-muted-foreground">
                {resume.ats.score}% JD keyword match · {resume.ats.pages} page{resume.ats.pages === 1 ? "" : "s"}
              </p>
            </div>
            <SkillBadges matched={resume.ats.matchedKeywords} missing={resume.ats.missingKeywords} />
            <div className="flex flex-wrap gap-2">
              <Button render={<a href={`/files/resumes/${resume.pdfPath.split("/").pop()}`} target="_blank" rel="noreferrer" />}>
                Download Resume
              </Button>
              {resume.driveLink && (
                <Button variant="outline" render={<a href={resume.driveLink} target="_blank" rel="noreferrer" />}>
                  Share to Drive
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {drafts && drafts.length > 0 && (
        <div className="flex flex-col gap-4">
          {drafts.map(({ employee, message }) => (
            <Card key={employee.linkedin}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={employee.name} />
                  <p className="text-sm font-medium text-foreground">
                    {employee.name} ({employee.title})
                  </p>
                </div>
                <Textarea readOnly value={message} className="min-h-24 resize-none" />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={cn("text-xs", message.length > 200 ? "text-destructive" : "text-muted-foreground")}>
                    {message.length}/200
                  </p>
                  <Button variant="outline" size="sm" onClick={() => copy(employee.linkedin, message)}>
                    {copiedFor === employee.linkedin ? "Copied!" : "Copy to Clipboard"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {contacts && contacts.length === 0 && (
        <EmptyState icon={UsersIcon} title="No employees found" description="Try again later, or check the company's LinkedIn page directly." />
      )}

      {contacts && contacts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map(employee => (
            <ContactCard key={employee.linkedin} employee={employee} />
          ))}
        </div>
      )}
    </div>
  );
}
