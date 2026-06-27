import { Router } from "express";
import { dashboard } from "../controllers/dashboard.controller";

const router = Router();

router.post("/", dashboard);

export default router;