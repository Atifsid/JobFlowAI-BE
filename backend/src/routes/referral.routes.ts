import { Router } from "express";
import { generateReferral, markReferralSent } from "../controllers/referral.controller";
import { validate } from "../middleware/validate";
import { MarkReferralSentSchema } from "../models/employee.schema";

const router = Router();

router.post("/generate/:jobId", generateReferral);
router.post("/sent/:jobId", validate(MarkReferralSentSchema), markReferralSent);

export default router;
