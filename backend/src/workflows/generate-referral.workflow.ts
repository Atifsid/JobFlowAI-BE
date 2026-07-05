import cache from "../services/jobs/job-cache.service";
import employeeService from "../services/employees/employee.service";
import referralService from "../services/referrals/referral.service";
import { JobStatus } from "../models/job-status.model";

class GenerateReferralWorkflow {
  async run(jobId: string) {
    const pipeline = await cache.getPipeline(jobId);

    if (!pipeline)
      throw new Error("Job not found");

    const { job, driveLink } = pipeline;

    const employees = await employeeService.find(job.company);

    // driveLink is set by resume.workflow when Drive upload is enabled;
    // without it the drafts simply don't reference a resume link (the
    // prompt is told not to invent one).
    const messages = await Promise.all(
      employees.map(async employee => ({
        employee,
        message: await referralService.generate(job, employee, driveLink)
      }))
    );

    // Drafts exist for real people at this company - the job is now
    // referral-ready. Forward-only, so an already-sent referral or an
    // applied job is never demoted by a re-run.
    await cache.advanceStatus(jobId, JobStatus.REFERRAL_READY);

    return messages;
  }
}

export default new GenerateReferralWorkflow();