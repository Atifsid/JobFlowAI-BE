export interface JobSearch {
  title?: string;
  keywords?: string[];
  company?: string;
  city?: string;
  region?: string;
  country?: string;
  remote?: boolean;
  seniority?: string[];
  minSalary?: number;
  maxSalary?: number;
  daysAgo?: number;
  page?: number;
  limit?: number;
}
