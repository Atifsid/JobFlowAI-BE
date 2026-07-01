import { AIMessage } from "../services/ai/ai.types";

export const buildTailorProjectsPrompt = (
  projects: string,
  jobDescription: string
): AIMessage[] => [
  {
    role: "system",
    content: `You are an expert resume writer helping tailor the Projects
section of a candidate's master resume for a specific job.

Rules:
- Never invent projects or change project names - only rewrite
  descriptions that already exist in the input.
- Reword descriptions to emphasize the technologies and outcomes most
  relevant to the job description, to help pass ATS screening.
- Never touch formatting, styles, fonts, or layout - return plain text only.
- Preserve roughly the same length as the input. If your output would be
  meaningfully longer, say so at the end prefixed with "OVERFLOW WARNING:".
- Return only the finished Projects section text, nothing else.`
  },
  {
    role: "user",
    content: `Current Projects section:\n${projects}\n\nJob Description:\n${jobDescription}`
  }
];
