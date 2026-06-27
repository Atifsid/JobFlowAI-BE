import { Request, Response } from "express";
import workflow from "../workflows/search-jobs.workflow";
import { success, failure } from "../utils/api-response";

export const searchJobs = async (req: Request, res: Response) => {
  try {
    return success(res, await workflow.run(req.body));
  } catch (e: any) {
    return failure(res, e.message);
  }
};