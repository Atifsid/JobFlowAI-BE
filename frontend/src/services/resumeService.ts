import { request } from "./api";
import type { ResumeResult } from "../types";

export const resumeService = {
  generate: (jobId: string) => request<ResumeResult>(`/api/resume/generate/${jobId}`, { method: "POST" })
};
