import { useState } from "react";
import { referralService } from "../services/referralService";
import type { ReferralDraft } from "../types";

export function useReferral(jobId: string | undefined) {
  const [drafts, setDrafts] = useState<ReferralDraft[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      setDrafts(await referralService.generateDrafts(jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Referral drafting failed");
    } finally {
      setLoading(false);
    }
  };

  return { drafts, loading, error, generate };
}
