import { z } from "zod";

export const JobSearchSchema = z.object({
  title: z.string().min(1).optional(),
  keywords: z.array(z.string()).optional(),
  company: z.string().min(1).optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  remote: z.boolean().optional(),
  seniority: z.array(z.string()).optional(),
  minYears: z.number().min(0).optional(),
  maxYears: z.number().min(0).optional(),
  minSalary: z.number().positive().optional(),
  maxSalary: z.number().positive().optional(),
  daysAgo: z.number().positive().optional(),
  page: z.number().default(1),
  limit: z.number().default(20)
});
