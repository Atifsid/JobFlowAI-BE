import cache from "../services/jobs/job-cache.service";
import tailor from "../services/resume/resume-tailor.service";
import sheets from "../services/sheets/sheets.service";

class ResumeWorkflow {
  async run(jobId: string) {
    const job = await cache.get(jobId);

    if (!job)
      throw new Error("Job not found.");

    const path = await tailor.generate(job);

    // later
    // await sheets.updateResume(jobId, path);

    return { path };
  }
}

export default new ResumeWorkflow();