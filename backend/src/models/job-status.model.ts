export enum JobStatus {
  DISCOVERED = "DISCOVERED",
  RESUME_GENERATED = "RESUME_GENERATED",
  EMPLOYEES_FOUND = "EMPLOYEES_FOUND",
  REFERRAL_READY = "REFERRAL_READY",
  REFERRAL_SENT = "REFERRAL_SENT",
  APPLIED = "APPLIED",
  REJECTED = "REJECTED",
  INTERVIEW = "INTERVIEW",
  OFFER = "OFFER",
  HIRED = "HIRED",
  SKIPPED = "SKIPPED"
}

// The forward progression a job moves through as the pipeline runs.
// REJECTED and SKIPPED are terminal side-exits, deliberately not in the
// flow - they rank below everything, so an explicit pipeline re-run on a
// skipped job revives it.
export const STATUS_FLOW: JobStatus[] = [
  JobStatus.DISCOVERED,
  JobStatus.RESUME_GENERATED,
  JobStatus.EMPLOYEES_FOUND,
  JobStatus.REFERRAL_READY,
  JobStatus.REFERRAL_SENT,
  JobStatus.APPLIED,
  JobStatus.INTERVIEW,
  JobStatus.OFFER,
  JobStatus.HIRED
];

export const statusRank = (status: JobStatus): number =>
  STATUS_FLOW.indexOf(status);

export const hasReached = (status: JobStatus, target: JobStatus): boolean =>
  statusRank(status) >= statusRank(target);
