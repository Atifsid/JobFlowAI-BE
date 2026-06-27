import { JobStatus } from "./job-status.model";

export interface JobRecord {
  id: string;
  company: string;
  title: string;
  location: string;
  score: number;
  decision: string;
  status: JobStatus;
  resumePath?: string;
  applyUrl: string;
  companyUrl?: string;
  linkedinUrl?: string;
  referralMessage?: string;
  contactedEmployees?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}