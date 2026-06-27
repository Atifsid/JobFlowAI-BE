import { Router } from "express";
import { searchJobs } from "../controllers/job.controller";
import { JobSearchSchema } from "../models/job-search.schema";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/search", validate(JobSearchSchema), searchJobs);

export default router;