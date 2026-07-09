import { randomUUID } from "crypto";
import employeeService from "../services/employees/employee.service";
import referralService from "../services/referrals/referral.service";
import { Job } from "../models/job.model";

interface GenerateReferralAdhocInput {
  title: string;
  company: string;
  driveLink?: string;
}

class GenerateReferralAdhocWorkflow {
  async run(input: GenerateReferralAdhocInput) {
    const job: Job = {
      id: randomUUID(),
      title: input.title,
      company: input.company,
      description: "",
      location: "Not specified",
      remote: false,
      skills: [],
      applyUrl: "",
      source: "manual"
    };

    const employees = await employeeService.find(input.company);

    return Promise.all(
      employees.map(async employee => ({
        employee,
        message: await referralService.generate(job, employee, input.driveLink)
      }))
    );
  }
}

export default new GenerateReferralAdhocWorkflow();
