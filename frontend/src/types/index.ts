export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  remote: boolean;
  seniority?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  description: string;
  skills: string[];
  applyUrl: string;
  companyUrl?: string;
  postedAt?: string;
  source: string;
}

export type JobStatus =
  | "DISCOVERED" | "RESUME_GENERATED" | "EMPLOYEES_FOUND"
  | "REFERRAL_READY" | "REFERRAL_SENT" | "APPLIED" | "REJECTED"
  | "INTERVIEW" | "OFFER" | "HIRED" | "SKIPPED";

export interface JobPipeline {
  job: Job;
  status: JobStatus;
}

export interface Dashboard {
  total: number;
  resumesGenerated: number;
  referralsReady: number;
  applied: number;
  jobs: JobPipeline[];
  page?: number;
  limit?: number;
  totalMatches?: number;
}

export interface Employee {
  name: string;
  title: string;
  company: string;
  linkedin: string;
}

export interface JobSearchParams {
  title?: string;
  keywords?: string[];
  company?: string;
  remote?: boolean;
  country?: string;
  city?: string;
  region?: string;
  seniority?: string[];
  minSalary?: number;
  maxSalary?: number;
  daysAgo?: number;
  page?: number;
  limit?: number;
}

export interface ResumeResult {
  pdfPath: string;
  driveLink?: string;
}

export interface ReferralDraft {
  employee: Employee;
  message: string;
}
