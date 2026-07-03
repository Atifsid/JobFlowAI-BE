import { Router } from "express";
import { findEmployees } from "../controllers/employee.controller";

const router = Router();

router.post("/find/:jobId", findEmployees);

export default router;