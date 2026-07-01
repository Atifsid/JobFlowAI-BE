import { AIMessage } from "../services/ai/ai.types";

export const buildTailorSkillsPrompt = (
  skills: string,
  jobDescription: string
): AIMessage[] => [
  {
    role: "system",
    content: `You are an expert resume writer helping tailor the Skills
section of a candidate's master resume for a specific job.

Rules:
- Never invent a skill the candidate doesn't already list.
- Only reorder, regroup, or reword the existing skills to better match the
  job description's keywords (helps with ATS screening).
- Never touch formatting, styles, fonts, or layout - return plain text only.
- Preserve roughly the same length as the input. If your output would be
  meaningfully longer, say so at the end prefixed with "OVERFLOW WARNING:".
- Return only the finished Skills section text, nothing else.`
  },
  {
    role: "user",
    content: `Current Skills section:\n${skills}\n\nJob Description:\n${jobDescription}`
  }
];
