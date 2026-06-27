import { Job } from "../../models/job.model";

export const mapHireBaseJob = (job: any): Job => ({
  id: job._id,
  title: job.job_title,
  company: job.company_name,
  location: job.location_raw,
  country: job.locations?.[0]?.country,
  remote: job.location_type === "Remote",
  employmentType: job.job_type,
  salaryMin: job.salary_range?.min,
  salaryMax: job.salary_range?.max,
  currency: job.salary_range?.currency,
  description: job.description_raw || job.description,
  skills: [...(job.skills || []), ...(job.technologies || [])],
  applyUrl: job.application_link,
  companyUrl: job.company_link,
  postedAt: job.date_posted,
  source: "HireBase"
});