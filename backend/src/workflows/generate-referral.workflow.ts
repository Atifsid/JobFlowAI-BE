import cache from "../services/jobs/job-cache.service";
import employeeService from "../services/employees/employee.service";
import referralService from "../services/referrals/referral.service";
import { JobStatus } from "../models/job-status.model";

class GenerateReferralWorkflow {
  async run(jobId: string) {
    const job = await cache.get(jobId);

    if (!job)
      throw new Error("Job not found");

    const employees = await employeeService.find(job.company);

    const messages = await Promise.all(
      employees.map(async employee => ({
        employee,
        message: await referralService.generate(
          job,
          employee,
          "<Resume Link>"
        )
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