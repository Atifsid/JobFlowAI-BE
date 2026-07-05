import { JobPipeline } from "../../models/job-pipeline.model";

export const toSheetRow = (job: JobPipeline) => [
  job.job.id,
  job.job.company,
  job.job.title,
  job.job.location,
  job.status,
  job.job.applyUrl,
  job.job.companyUrl ?? "",
  new Date().toISOString()
];
