import { Router } from "express";
import { generateReferral } from "../controllers/referral.controller";

const router = Router();

router.post("/generate/:jobId", generateReferral);

export default router;
