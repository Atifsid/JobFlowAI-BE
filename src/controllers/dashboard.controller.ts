import { Request, Response } from "express";
import { success, failure } from "../utils/api-response";
import jobCacheService from "../services/jobs/job-cache.service";
import dashboardService from "../services/dashboard/dashboard.service";

export const dashboard = async (_req: Request, res: Response) => {
  try {
    const jobs = await jobCacheService.getAll();
    return success(res, dashboardService.build(jobs));
  } catch (err: any) {
    return failure(res, err.message);
  }
};