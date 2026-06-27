import { AIMessage } from "../services/ai/ai.types";

export const buildResumeScorePrompt = (job: string, resume: string): AIMessage[] => [
  {
    role: "system",
    content: `You are an ATS system.

Return ONLY valid JSON.

{
  "score":0,
  "missingSkills":[],
  "strengths":[],
  "weaknesses":[],
  "recommendation":""
}`
  },
  {
    role: "user",
    content: `JOB DESCRIPTION

${job}

----------------

RESUME

${resume}`
  }
];