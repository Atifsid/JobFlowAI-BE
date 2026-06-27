export interface JobSearch {
  title: string;
  keywords?: string[];
  companyKeywords?: string[];
  city?: string;
  region?: string;
  country?: string;
  remote?: boolean;
  experience?: string[];
  jobTypes?: string[];
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  visa?: boolean;
  daysAgo?: number;
  page?: number;
  limit?: number;
}