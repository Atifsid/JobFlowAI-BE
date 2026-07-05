import type { BadgeTone } from "../components/shared/StatusBadge";
import type { Job, JobAction, JobDecision, JobStatus } from "../types";

export const ALL_STATUSES: JobStatus[] = [
  "DISCOVERED",
  "ANALYZED",
  "RESUME_GENERATED",
  "EMPLOYEES_FOUND",
  "REFERRAL_READY",
  "REFERRAL_SENT",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
  "SKIPPED"
];

const STATUS_LABELS: Record<JobStatus, string> = {
  DISCOVERED: "Discovered",
  ANALYZED: "Analyzed",
  RESUME_GENERATED: "Resume Generated",
  EMPLOYEES_FOUND: "Contacts Found",
  REFERRAL_READY: "Referral Ready",
  REFERRAL_SENT: "Referral Sent",
  APPLIED: "Applied",
  INTERVIEW: "Interviewing",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  SKIPPED: "Skipped"
};

export const labelForStatus = (status: JobStatus): string => STATUS_LABELS[status];

export const toneForStatus = (status: JobStatus): BadgeTone => {
  if (["APPLIED", "REFERRAL_SENT", "OFFER", "HIRED"].includes(status)) return "success";
  if (["REFERRAL_READY", "EMPLOYEES_FOUND", "RESUME_GENERATED"].includes(status)) return "warning";
  if (["REJECTED", "SKIPPED"].includes(status)) return "error";
  return "neutral";
};

const DECISION_LABELS: Record<JobDecision, string> = {
  REFERRAL: "Referral",
  DIRECT_APPLY: "Direct Apply",
  SKIP: "Skip"
};

export const labelForDecision = (decision: JobDecision): string => DECISION_LABELS[decision];

export const toneForDecision = (decision: JobDecision): BadgeTone => {
  if (decision === "REFERRAL") return "success";
  if (decision === "DIRECT_APPLY") return "warning";
  return "neutral";
};

const DECISION_REASONING: Record<JobDecision, string> = {
  REFERRAL: "Scored 90 or above — strong enough to ask for a referral.",
  DIRECT_APPLY: "Scored 75–89 — a solid match, worth applying to directly.",
  SKIP: "Scored below 75 — not a close enough match to pursue."
};

export const reasoningForDecision = (decision: JobDecision): string => DECISION_REASONING[decision];

export interface ActionSpec {
  label: string;
  kind: "route" | "external" | "status" | "disabled";
  to?: string;
  status?: JobStatus;
}

export const specForAction = (action: JobAction, job: Job): ActionSpec => {
  switch (action) {
    case "GENERATE_RESUME":
      return { label: "Tailor Resume", kind: "route", to: `/jobs/${job.id}/resume` };
    case "FIND_EMPLOYEES":
      return { label: "Find Contacts", kind: "route", to: `/jobs/${job.id}/employees` };
    case "GENERATE_REFERRAL":
      return { label: "Draft Referral", kind: "route", to: `/jobs/${job.id}/referral` };
    case "APPLY":
      return { label: "Apply", kind: "external", to: job.applyUrl };
    case "GENERATE_COVER_LETTER":
      return { label: "Cover Letter", kind: "disabled" };
    case "FOLLOW_UP":
      return { label: "Follow Up", kind: "disabled" };
    case "SKIP":
      return { label: "Skip", kind: "status", status: "SKIPPED" };
  }
};
