import { JobPipeline } from "./job-pipeline.model";

// Summarizes pipeline activity - work actually done - rather than any
// pre-judged fit of the postings themselves.
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
