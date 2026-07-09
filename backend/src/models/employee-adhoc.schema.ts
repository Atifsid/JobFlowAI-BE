import { z } from "zod";

export const FindEmployeesAdhocSchema = z.object({
  company: z.string().min(1)
});
