import { Request, Response } from "express";
import workflow from "../workflows/search-jobs.workflow";
import { success, failure } from "../utils/api-response";

export const dashboard = async (req: Request, res: Response) => {
  try {
    return success(res, await workflow.run(req.body));
  } catch (err: any) {
    return failure(res, err.message);
  }
};