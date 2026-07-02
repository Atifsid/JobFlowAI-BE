import { useState } from "react";
import { resumeService } from "../services/resumeService";
import type { ResumeResult } from "../types";

export function useResume(jobId: string | undefined) {
  const [resume, setResume] = useState<ResumeResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!jobId) return;
    setGenerating(true);
    setError(null);
    try {
      setResume(await resumeService.generate(jobId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume generation failed");
    } finally {
      setGenerating(false);
    }
  };

  return { resume, generating, error, generate };
}
