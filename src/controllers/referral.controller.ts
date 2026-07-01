import { Request, Response } from "express";
import workflow from "../workflows/generate-referral.workflow";
import { success, failure } from "../utils/api-response";

export const generateReferral = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    return success(res, await workflow.run(jobId));
  } catch (e: any) {
    return failure(res, e.message);
  }
};
