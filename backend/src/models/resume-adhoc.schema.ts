import { z } from "zod";

export const GenerateResumeAdhocSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(50)
});
