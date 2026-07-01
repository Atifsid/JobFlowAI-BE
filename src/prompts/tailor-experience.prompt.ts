import { AIMessage } from "../services/ai/ai.types";

export const buildTailorExperiencePrompt = (
  experience: string,
  jobDescription: string
): AIMessage[] => [
  {
    role: "system",
    content: `You are an expert resume writer helping tailor the Experience
section of a candidate's master resume for a specific job.

Rules:
- Never invent experience, employers, titles, or dates - only rewrite
  bullets that already exist in the input.
- Reword bullets to emphasize the achievements and keywords most relevant
  to the job description, to help pass ATS screening.
- Never touch formatting, styles, fonts, or layout - return plain text only.
- Preserve roughly the same length as the input. If your output would be
  meaningfully longer, say so at the end prefixed with "OVERFLOW WARNING:".
- Return only the finished Experience section text, nothing else.`
  },
  {
    role: "user",
    content: `Current Experience section:\n${experience}\n\nJob Description:\n${jobDescription}`
  }
];
