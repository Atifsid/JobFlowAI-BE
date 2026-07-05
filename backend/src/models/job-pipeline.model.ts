import { Job } from "./job.model";
import { JobStatus } from "./job-status.model";

// The per-job record persisted in the local cache and rendered by the
// frontend. Search stores just the job + a status; pipeline runs (resume
// generation, referral drafting) advance the status. No fit-scoring
// happens at fetch time - the master resume is a content pool, not
// something to grade jobs against.
export interface JobPipeline {
  job: Job;
  status: JobStatus;
}
