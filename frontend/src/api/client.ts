import type {
  Dashboard,
  Employee,
  JobSearchParams,
  ReferralDraft,
  ResumeResult
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });

  const body: ApiEnvelope<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new Error(body.message || `Request to ${path} failed`);
  }

  return body.data as T;
}

export const api = {
  searchJobs: (params: JobSearchParams) =>
    request<Dashboard>("/api/jobs/search", {
      method: "POST",
      body: JSON.stringify(params)
    }),

  getDashboard: () => request<Dashboard>("/api/dashboard"),

  generateResume: (jobId: string) =>
    request<ResumeResult>(`/api/resume/generate/${jobId}`, { method: "POST" }),

  findEmployees: (jobId: string) =>
    request<Employee[]>(`/api/employees/find/${jobId}`, { method: "POST" }),

  generateReferrals: (jobId: string) =>
    request<ReferralDraft[]>(`/api/referral/generate/${jobId}`, { method: "POST" })
};
