import cache from "../services/jobs/job-cache.service";
import tailor from "../services/resume/resume-tailor.service";
import pdfCompiler from "../services/resume/compiler/pdf-compiler.service";
import driveService from "../services/drive/drive.service";
import { env } from "../config/env";

class ResumeWorkflow {
  async run(jobId: string) {
    const job = await cache.get(jobId);

    if (!job) throw new Error("Job not found.");

    const { docPath } = await tailor.generate(job);

    let pdfPath: string | undefined;
    let driveLink: string | undefined;

    if (env.RESUME_PDF_ENABLED) {
      pdfPath = await pdfCompiler.compile(docPath);
    }

    if (env.DRIVE_UPLOAD_ENABLED) {
      const uploadPath = pdfPath ?? docPath;
      const fileName = uploadPath.split("/").pop() as string;
      driveLink = await driveService.upload(uploadPath, fileName);
    }

    return { docPath, pdfPath, driveLink };
  }
}

export default new ResumeWorkflow();
