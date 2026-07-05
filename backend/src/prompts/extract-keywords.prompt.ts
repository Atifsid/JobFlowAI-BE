import { AIMessage } from "../services/ai/ai.types";

export const buildExtractKeywordsPrompt = (
  jobDescription: string
): AIMessage[] => [
  {
    role: "system",
    content: `You extract the keywords a resume must contain to pass ATS
screening for a specific job posting.

Rules:
- Return ONLY a JSON array of strings - no prose, no markdown fences, no
  explanation before or after.
- 15 to 20 keywords, most important first.
- Hard skills and concrete terms only: languages, frameworks, tools,
  platforms, methodologies, certifications, domain terms. Never soft
  skills ("communication", "team player", "self-starter").
- Use the exact wording from the job description (e.g. "React Native",
  not "react-native"; "CI/CD", not "continuous integration" if the
  posting says CI/CD).
- No duplicates, no near-duplicates ("AWS" and "Amazon Web Services" -
  keep the one the posting uses).

Example output:
["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "CI/CD"]`
  },
  {
    role: "user",
    content: `Job Description:\n${jobDescription}`
  }
];
