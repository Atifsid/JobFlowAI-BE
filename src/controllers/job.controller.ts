import { Request, Response } from "express";
import workflow from "../workflows/search-jobs.workflow";
import updateJobStatusWorkflow from "../workflows/update-job-status.workflow";
import { success, failure } from "../utils/api-response";

export const searchJobs = async (req: Request, res: Response) => {
  try {
    return success(res, await workflow.run(req.body));
  } catch (e: any) {
    return failure(res, e.message);
  }
};

export const updateJobStatus = async (req: Request, res: Response) => {
  try {
    const jobId = Array.isArray(req.params.jobId) ? req.params.jobId[0] : req.params.jobId;
    return success(res, await updateJobStatusWorkflow.run({ jobId, status: req.body.status }));
  } catch (e: any) {
    return failure(res, e.message);
  }
};