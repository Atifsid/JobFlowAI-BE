import { Router } from "express";
import { generateResume, generateResumeAdhoc } from "../controllers/resume.controller";
import { GenerateResumeAdhocSchema } from "../models/resume-adhoc.schema";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/generate/:jobId", generateResume);
router.post("/generate-adhoc", validate(GenerateResumeAdhocSchema), generateResumeAdhoc);

export default router;
