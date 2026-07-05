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

// Deterministic post-generation check of a tailored resume.
export interface AtsReport {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  // JD keywords absent from the master resume - fit gaps, not
  // generation failures. Optional: reports persisted before this field
  // existed don't have it.
  trueGaps?: string[];
  pages: number;
  missingEmployers: string[];
  passed: boolean;
}

export interface JobPipeline {
  job: Job;
  status: JobStatus;
  keywords?: string[];
  ats?: AtsReport;
  driveLink?: string;
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
  ats?: AtsReport;
}

export interface ReferralDraft {
  employee: Employee;
  message: string;
}
