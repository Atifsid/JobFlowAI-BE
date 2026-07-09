import { Router } from "express";
import { generateReferral, generateReferralAdhoc, markReferralSent } from "../controllers/referral.controller";
import { GenerateReferralAdhocSchema } from "../models/referral-adhoc.schema";
import { validate } from "../middleware/validate";
import { MarkReferralSentSchema } from "../models/employee.schema";

const router = Router();

router.post("/generate/:jobId", generateReferral);
router.post("/generate-adhoc", validate(GenerateReferralAdhocSchema), generateReferralAdhoc);
router.post("/sent/:jobId", validate(MarkReferralSentSchema), markReferralSent);

export default router;
