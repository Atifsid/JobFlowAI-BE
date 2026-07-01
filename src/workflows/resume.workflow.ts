import cache from "../services/jobs/job-cache.service";
import tailor from "../services/resume/resume-tailor.service";
import driveService from "../services/drive/drive.service";
import { env } from "../config/env";

class ResumeWorkflow {
  async run(jobId: string) {
    const job = await cache.get(jobId);

    if (!job) throw new Error("Job not found.");

    const { pdfPath } = await tailor.generate(job);

    let driveLink: string | undefined;

    if (env.DRIVE_UPLOAD_ENABLED) {
      const fileName = pdfPath.split("/").pop() as string;
      driveLink = await driveService.upload(pdfPath, fileName);
    }

    return { pdfPath, driveLink };
  }
}

export default new ResumeWorkflow();
