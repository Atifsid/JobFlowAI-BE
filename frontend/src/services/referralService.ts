import { request } from "./api";
import type { ReferralDraft } from "../types";

export const referralService = {
  generateDrafts: (jobId: string) => request<ReferralDraft[]>(`/api/referral/generate/${jobId}`, { method: "POST" })
};
