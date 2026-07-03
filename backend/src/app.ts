import express from "express";
import path from "path";
import jobRoutes from "./routes/job.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import resumeRoutes from "./routes/resume.routes";
import employeeRoutes from "./routes/employee.routes";
import referralRoutes from "./routes/referral.routes";

const app = express();

app.use(express.json());

app.use("/api/jobs", jobRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/referral", referralRoutes);

app.get("/health", (_, res) => res.json({ success: true }));

app.use("/files/resumes", express.static(path.join(process.cwd(), "storage/resumes/generated")));

const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");
app.use(express.static(frontendDist));
app.get(/^(?!\/api|\/files).*/, (_req, res) => {
  res.sendFile(path.join(frontendDist, "index.html"));
});

export default app;