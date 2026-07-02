import { Job } from "../../../../models/job.model";

export interface JobspediaJob {
  id: string;
  title: string;
  company: string;
  location: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  isRemote: boolean;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  applyUrl: string;
  description: string | null;
  datePosted: string | null;
  platform: string;
  source: string;
}

export const mapJobspediaJob = (job: JobspediaJob): Job => ({
  id: job.id,
  title: job.title,
  company: job.company,
  location:
    job.location ?? [job.city, job.region, job.country].filter(Boolean).join(", "),
  country: job.country ?? undefined,
  remote: job.isRemote,
  salaryMin: job.salaryMin ?? undefined,
  salaryMax: job.salaryMax ?? undefined,
  currency: job.currency ?? undefined,
  description: job.description ?? "",
  skills: [],
  applyUrl: job.applyUrl,
  postedAt: job.datePosted ?? undefined,
  source: "Jobspedia"
});
