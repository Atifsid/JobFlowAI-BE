import { Router } from "express";
import { findEmployees, findEmployeesAdhoc } from "../controllers/employee.controller";
import { FindEmployeesAdhocSchema } from "../models/employee-adhoc.schema";
import { validate } from "../middleware/validate";

const router = Router();

router.post("/find/:jobId", findEmployees);
router.post("/find-adhoc", validate(FindEmployeesAdhocSchema), findEmployeesAdhoc);

export default router;
