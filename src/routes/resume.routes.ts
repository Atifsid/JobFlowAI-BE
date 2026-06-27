import { Router } from "express";
import { generateResume } from "../controllers/resume.controller";

const router = Router();

router.post("/generate/:jobId", generateResume);

export default router;