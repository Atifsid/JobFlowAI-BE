import { AIMessage } from "../services/ai/ai.types";

export const buildJobSummaryPrompt = (description: string): AIMessage[] => [
  {
    role: "system",
    content: "You are an expert technical recruiter. Summarize jobs in concise bullet points."
  },
  {
    role: "user",
    content: description
  }
];