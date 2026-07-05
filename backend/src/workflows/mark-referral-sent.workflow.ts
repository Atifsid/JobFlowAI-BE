import cache from "../services/jobs/job-cache.service";
import contactsService from "../services/sheets/contacts.service";
import { Employee } from "../models/employee.model";
import { JobStatus } from "../models/job-status.model";
import { env } from "../config/env";

interface MarkReferralSentInput {
  jobId: string;
  employee: Employee;
}

// Runs when the user has actually sent a connection note on LinkedIn
// (by hand - sending is never automated) and clicks "Mark as sent":
// records the person on the Contacts tab for follow-up and advances the
// job's status.
class MarkReferralSentWorkflow {
  async run({ jobId, employee }: MarkReferralSentInput) {
    const pipeline = await cache.getPipeline(jobId);

    if (!pipeline) throw new Error("Job not found");

    if (env.GOOGLE_SHEET_ID) {
      await contactsService.markSent(pipeline.job, employee, pipeline.driveLink);
    }

    await cache.advanceStatus(jobId, JobStatus.REFERRAL_SENT);

    return { tracked: Boolean(env.GOOGLE_SHEET_ID) };
  }
}

export default new MarkReferralSentWorkflow();
