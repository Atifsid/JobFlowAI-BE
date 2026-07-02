import { request } from "./api";
import type { Dashboard, JobPipeline, JobSearchParams, JobStatus } from "../types";

export const jobService = {
  search: (params: JobSearchParams) =>
    request<Dashboard>("/api/jobs/search", {
      method: "POST",
      body: JSON.stringify(params)
    }),

  updateStatus: (jobId: string, status: JobStatus) =>
    request<JobPipeline>(`/api/jobs/${jobId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    })
};
