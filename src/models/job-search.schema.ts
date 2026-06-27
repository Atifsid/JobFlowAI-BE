import { z } from "zod";

export const JobSearchSchema = z.object({
  title: z.string().min(1),
  keywords: z.array(z.string()).optional(),
  companyKeywords: z.array(z.string()).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  remote: z.boolean().optional(),
  experience: z.array(z.string()).optional(),
  page: z.number().default(1),
  limit: z.number().default(5)
});