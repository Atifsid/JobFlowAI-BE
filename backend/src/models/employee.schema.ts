import { z } from "zod";

// Body of POST /referral/sent/:jobId - the employee the user just sent a
// connection note to on LinkedIn.
export const MarkReferralSentSchema = z.object({
  employee: z.object({
    name: z.string().min(1),
    title: z.string(),
    company: z.string(),
    linkedin: z.string().min(1)
  })
});
