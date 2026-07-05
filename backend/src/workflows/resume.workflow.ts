import cache from "../services/jobs/job-cache.service";
import tailor from "../services/resume/resume-tailor.service";
import driveService from "../services/drive/drive.service";
import sheetsService from "../services/sheets/sheets.service";
import { toSheetRow } from "../services/sheets/job-record.mapper";
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

    // Sheets tracking happens here - the first step of the per-job pipeline the
    // user explicitly runs on their selected (up to 5) jobs - rather than during
    // search, where it used to write a row per search result and blow through
    // Google's API quota. Gated on GOOGLE_SHEET_ID being configured, same as
    // Drive upload is gated on DRIVE_UPLOAD_ENABLED.
    if (env.GOOGLE_SHEET_ID) {
      const pipeline = await cache.getPipeline(jobId);
      if (pipeline) {
        await sheetsService.upsert(jobId, toSheetRow(pipeline));
      }
    }

    return { pdfPath, driveLink };
  }
}

export default new ResumeWorkflow();
