import cache from "../services/jobs/job-cache.service";
import employeeService from "../services/employees/employee.service";
import referralService from "../services/referrals/referral.service";

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

    return messages;
  }
}

export default new GenerateReferralWorkflow();