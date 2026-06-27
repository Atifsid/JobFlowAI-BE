export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  country?: string;
  remote: boolean;
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