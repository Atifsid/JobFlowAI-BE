export interface JobSearch {
  title?: string;
  keywords?: string[];
  company?: string;
  city?: string;
  region?: string;
  country?: string;
  remote?: boolean;
  seniority?: string[];
  // Filters on years-of-experience text extracted from the JD body
  // (experience-requirement.service.ts) - a more reliable signal than
  // jobspedia's title-only seniority bucket, which defaults every
  // unlabeled title to "mid" regardless of the years actually required.
  minYears?: number;
  maxYears?: number;
  minSalary?: number;
  maxSalary?: number;
  daysAgo?: number;
  page?: number;
  limit?: number;
}
