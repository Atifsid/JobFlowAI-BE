import { Job } from "./job.model";
import { JobStatus } from "./job-status.model";
import { AtsReport } from "./ats-report.model";

// The per-job record persisted in the local cache and rendered by the
// frontend. Search stores just the job + a status; pipeline runs (resume
// generation, referral drafting) advance the status. No fit-scoring
// happens at fetch time - the master resume is a content pool, not
// something to grade jobs against.
export interface JobPipeline {
  job: Job;
  status: JobStatus;
  // Target keywords extracted from the JD when the pipeline ran resume
  // generation - input to the tailoring prompts and the ATS gate.
  keywords?: string[];
  // Result of the deterministic ATS check of the last generated resume.
  ats?: AtsReport;
  // Shareable Google Drive link of the last uploaded resume - what the
  // referral drafts point recipients at.
  driveLink?: string;
}
