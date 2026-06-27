import { AIMessage } from "../services/ai/ai.types";

export const buildTailorResumePrompt = (resume: string, job: string): AIMessage[] => [
  {
    role: "system",
    content: "You are an ATS resume expert. Improve the resume for this job. Keep everything truthful. Return markdown only."
  },
  {
    role: "user",
    content: `JOB DESCRIPTION\n\n${job}\n\n------------------\n\nRESUME\n\n${resume}`
  }
];