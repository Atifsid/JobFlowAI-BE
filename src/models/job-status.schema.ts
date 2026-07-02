import { z } from "zod";
import { JobStatus } from "./job-status.model";

export const JobStatusSchema = z.object({
  status: z.nativeEnum(JobStatus)
});
