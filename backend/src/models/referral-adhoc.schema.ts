import { z } from "zod";

export const GenerateReferralAdhocSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  driveLink: z.string().optional()
});
