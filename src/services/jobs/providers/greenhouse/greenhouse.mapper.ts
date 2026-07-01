import { Job } from "../../../../models/job.model";

export interface GreenhouseJob {
  id: number;
  title: string;
  company_name?: string;
  absolute_url: string;
  location?: { name?: string };
  content?: string;
  updated_at?: string;
  first_published?: string;
}

export const mapGreenhouseJob = (
  job: GreenhouseJob,
  boardToken: string
): Job => {
  const location = job.location?.name ?? "";

  return {
    id: `greenhouse-${job.id}`,
    title: job.title,
    company: job.company_name || boardToken,
    location,
    remote: /remote/i.test(location),
    description: job.content ?? "",
    skills: [],
    applyUrl: job.absolute_url,
    postedAt: job.first_published ?? job.updated_at,
    source: "Greenhouse"
  };
};
