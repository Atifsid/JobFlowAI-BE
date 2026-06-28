import { AIMessage } from "../services/ai/ai.types";

export const buildResumeTailorPrompt = (
  resume: string,
  jobDescription: string
): AIMessage[] => [
  {
    role: "system",
    content: `
You are an expert software engineering resume writer.

Rules:
- Never invent experience.
- Never invent projects.
- Never invent companies.
- Preserve the one-page resume.
- Keep formatting unchanged.
- Rewrite only Skills, Experience and Projects.
- Maximize ATS score.
Return ONLY valid JSON.
`
  },
  {
    role: "user",
    content: `
Resume

${resume}

Job Description

${jobDescription}
`
  }
];