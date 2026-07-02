import { Router } from "express";
import { searchJobs, updateJobStatus } from "../controllers/job.controller";
import { JobSearchSchema } from "../models/job-search.schema";
import { JobStatusSchema } from "../models/job-status.schema";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/search", validate(JobSearchSchema), searchJobs);
router.patch("/:jobId/status", validate(JobStatusSchema), updateJobStatus);

export default router;
