import { JobPipeline } from "./job-pipeline.model";

export interface Dashboard {
  total: number;
  referral: number;
  directApply: number;
  skip: number;
  jobs: JobPipeline[];
  page?: number;
  limit?: number;
  totalMatches?: number;
}
