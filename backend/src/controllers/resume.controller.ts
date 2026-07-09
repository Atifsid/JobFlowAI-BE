import { Request, Response } from "express";
import { success, failure } from "../utils/api-response";
import resumeWorkflow from "../workflows/resume.workflow";
import generateResumeAdhocWorkflow from "../workflows/generate-resume-adhoc.workflow";

export const generateResume = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    return success(res, await resumeWorkflow.run(jobId));
  } catch (e: any) {
    return failure(res, e.message);
  }
};

export const generateResumeAdhoc = async (req: Request, res: Response) => {
  try {
    return success(res, await generateResumeAdhocWorkflow.run(req.body));
  } catch (e: any) {
    return failure(res, e.message);
  }
};