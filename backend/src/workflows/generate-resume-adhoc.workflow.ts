import { randomUUID } from "crypto";
import tailor from "../services/resume/resume-tailor.service";
import driveService from "../services/drive/drive.service";
import { Job } from "../models/job.model";
import { env } from "../config/env";

interface GenerateResumeAdhocInput {
  title: string;
  company: string;
  description: string;
}

class GenerateResumeAdhocWorkflow {
  async run(input: GenerateResumeAdhocInput) {
    const job: Job = {
      id: randomUUID(),
      title: input.title,
      company: input.company,
      description: input.description,
      location: "Not specified",
      remote: false,
      skills: [],
      applyUrl: "",
      source: "manual"
    };

    const { pdfPath, keywords, ats } = await tailor.generate(job);

    let driveLink: string | undefined;
    if (env.DRIVE_UPLOAD_ENABLED) {
      const fileName = pdfPath.split("/").pop() as string;
      driveLink = await driveService.upload(pdfPath, fileName);
    }

    return { pdfPath, driveLink, ats, keywords };
  }
}

export default new GenerateResumeAdhocWorkflow();
