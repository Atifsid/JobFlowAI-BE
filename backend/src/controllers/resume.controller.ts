import { Request, Response } from "express";
import { success, failure } from "../utils/api-response";
import resumeWorkflow from "../workflows/resume.workflow";

export const generateResume = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    return success(res, await resumeWorkflow.run(jobId));
  } catch (e: any) {
    return failure(res, e.message);
  }
};