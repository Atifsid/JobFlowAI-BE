import { Request, Response } from "express";
import workflow from "../workflows/generate-referral.workflow";
import markSentWorkflow from "../workflows/mark-referral-sent.workflow";
import { success, failure } from "../utils/api-response";

export const generateReferral = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    return success(res, await workflow.run(jobId));
  } catch (e: any) {
    return failure(res, e.message);
  }
};

export const markReferralSent = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    return success(res, await markSentWorkflow.run({ jobId, employee: req.body.employee }));
  } catch (e: any) {
    return failure(res, e.message);
  }
};
