import type { BadgeTone } from "../components/shared/StatusBadge";
import type { JobStatus } from "../types";

export const ALL_STATUSES: JobStatus[] = [
  "DISCOVERED",
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
