import { request } from "./api";
import type { ResumeResult } from "../types";

export const resumeService = {
  generate: (jobId: string) => request<ResumeResult>(`/api/resume/generate/${jobId}`, { method: "POST" }),
  generateAdhoc: (input: { title: string; company: string; description: string }) =>
    request<ResumeResult>("/api/resume/generate-adhoc", { method: "POST", body: JSON.stringify(input) })
};
