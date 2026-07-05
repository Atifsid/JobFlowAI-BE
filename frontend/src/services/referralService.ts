import { request } from "./api";
import type { Employee, ReferralDraft } from "../types";

export const referralService = {
  generateDrafts: (jobId: string) => request<ReferralDraft[]>(`/api/referral/generate/${jobId}`, { method: "POST" }),
  markSent: (jobId: string, employee: Employee) =>
    request<{ tracked: boolean }>(`/api/referral/sent/${jobId}`, {
      method: "POST",
      body: JSON.stringify({ employee })
    })
};
