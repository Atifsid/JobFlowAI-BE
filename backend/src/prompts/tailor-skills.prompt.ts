import { AIMessage } from "../services/ai/ai.types";

export const buildTailorSkillsPrompt = (
  skills: string,
  keywords: string[]
): AIMessage[] => [
  {
    role: "system",
    content: `You are an expert resume writer helping tailor the Skills
section of a candidate's master resume for a specific job application.

The input is the candidate's FULL master list of skills - more than
should appear on a single tailored one-page resume - plus the target
keywords extracted from the job description. Your job is to SELECT and
prioritize, not just reword.

Rules:
- Never invent a skill the candidate doesn't already list.
- Select only the skills most relevant to the target keywords - drop
  categories/skills that don't apply. Aim for roughly 4-6 lines total,
  not the full master list.
- You may reorder or regroup the selected skills to read naturally.
  Where the candidate has a skill that matches a target keyword, use the
  keyword's exact wording (helps with ATS screening).
- Never touch formatting, styles, fonts, or layout - return plain text only.
- If even the most relevant subset would still overflow a single page,
  say so at the end prefixed with "OVERFLOW WARNING:".
- Return only the finished Skills section text, nothing else.`
  },
  {
    role: "user",
    content: `Full Master Skills list:\n${skills}\n\nTarget keywords from the job description:\n${keywords.join(", ")}`
  }
];
