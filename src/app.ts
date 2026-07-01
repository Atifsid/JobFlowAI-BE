import express from "express";
import jobRoutes from "./routes/job.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import resumeRoutes from "./routes/resume.routes";
import employeeRoutes from "./routes/employee.routes";
import referralRoutes from "./routes/referral.routes";

const app = express();

app.use(express.json());
app.use("/jobs", jobRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/resume", resumeRoutes);
app.use("/employees", employeeRoutes);
app.use("/referral", referralRoutes);

app.get("/health", (_, res) => res.json({ success: true }));

export default app;