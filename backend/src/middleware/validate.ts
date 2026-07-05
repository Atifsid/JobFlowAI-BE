import { ZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import { failure } from "../utils/api-response";

export const validate = (schema: ZodObject) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    // Use the standard { success, message } envelope the frontend reads -
    // a bare zod flatten() has no message field, so the UI showed a
    // generic "request failed" instead of what was wrong.
    const detail = result.error.issues
      .map(issue => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    return failure(res, `Invalid request body - ${detail}`, 400, result.error.flatten());
  }
  req.body = result.data;
  next();
};
