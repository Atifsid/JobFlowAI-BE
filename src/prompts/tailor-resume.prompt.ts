import { AIMessage } from "../services/ai/ai.types";

export const buildResumeTailorPrompt = (
    sections: string,
    jobDescription: string
): AIMessage[] => [
    {
        role: "system",
        content: `
You are an expert FAANG resume writer.

You will receive JSON containing:

skills
experience
projects

Rewrite ONLY those fields.

Rules:

- Never invent experience.
- Never invent companies.
- Never invent projects.
- Preserve roughly the same length.
- Improve ATS score.

Return ONLY valid JSON with the same keys.
`
    },
    {
        role: "user",
        content: `
Sections

${sections}

Job Description

${jobDescription}
`
    }
];